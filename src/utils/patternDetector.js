const acorn = require('acorn');
const walk = require('acorn-walk');

class PatternDetector {
  constructor(db) {
    this.db = db;
    this.knownPatterns = {
      singleton: this.detectSingleton,
      factory: this.detectFactory,
      observer: this.detectObserver,
      decorator: this.detectDecorator
    };
  }

  async analyze(sourceCode) {
    const ast = acorn.parse(sourceCode, { ecmaVersion: 2022 });
    const patterns = [];
    
    walk.simple(ast, {
      ClassDeclaration: (node) => {
        Object.entries(this.knownPatterns).forEach(([name, detector]) => {
          const match = detector(node);
          if (match) {
            patterns.push({ type: name, confidence: match.confidence, location: node.loc });
          }
        });
      }
    });

    await this.savePatterns(patterns);
    return patterns;
  }

  detectSingleton(node) {
    let confidence = 0;
    
    const hasPrivateConstructor = node.body.body.some(member => 
      member.kind === 'constructor' && member.accessibility === 'private'
    );
    
    const hasStaticInstance = node.body.body.some(member =>
      member.type === 'PropertyDefinition' && member.static
    );

    if (hasPrivateConstructor) confidence += 0.5;
    if (hasStaticInstance) confidence += 0.5;

    return confidence > 0.7 ? { confidence } : null;
  }

  detectFactory(node) {
    let confidence = 0;
    
    const hasCreateMethod = node.body.body.some(member =>
      member.type === 'MethodDefinition' && 
      member.key.name.toLowerCase().includes('create')
    );
    
    const returnsNewInstance = node.body.body.some(member =>
      member.type === 'MethodDefinition' &&
      member.value.body.body.some(stmt =>
        stmt.type === 'ReturnStatement' &&
        stmt.argument.type === 'NewExpression'
      )
    );

    if (hasCreateMethod) confidence += 0.4;
    if (returnsNewInstance) confidence += 0.6;

    return confidence > 0.7 ? { confidence } : null;
  }

  detectObserver(node) {
    let confidence = 0;
    
    const hasSubscribe = node.body.body.some(member =>
      member.type === 'MethodDefinition' &&
      ['subscribe', 'addListener', 'on'].includes(member.key.name.toLowerCase())
    );
    
    const hasNotify = node.body.body.some(member =>
      member.type === 'MethodDefinition' &&
      ['notify', 'emit', 'trigger'].includes(member.key.name.toLowerCase())
    );

    if (hasSubscribe) confidence += 0.5;
    if (hasNotify) confidence += 0.5;

    return confidence > 0.7 ? { confidence } : null;
  }

  detectDecorator(node) {
    let confidence = 0;
    
    const hasWrappedInstance = node.body.body.some(member =>
      member.type === 'PropertyDefinition' &&
      member.key.name.toLowerCase().includes('wrapped')
    );
    
    const hasDelegation = node.body.body.some(member =>
      member.type === 'MethodDefinition' &&
      member.value.body.body.some(stmt =>
        stmt.type === 'ExpressionStatement' &&
        stmt.expression.type === 'CallExpression' &&
        stmt.expression.callee.object &&
        stmt.expression.callee.object.type === 'ThisExpression'
      )
    );

    if (hasWrappedInstance) confidence += 0.4;
    if (hasDelegation) confidence += 0.6;

    return confidence > 0.7 ? { confidence } : null;
  }

  async savePatterns(patterns) {
    const stmt = this.db.prepare(`
      INSERT INTO patterns (name, algorithm_version, validation_status, template_data)
      VALUES (?, ?, ?, ?)
    `);

    patterns.forEach(pattern => {
      stmt.run([
        pattern.type,
        '1.0.0',
        pattern.confidence > 0.8 ? 'valid' : 'needs_review',
        JSON.stringify(pattern)
      ]);
    });
  }
}

module.exports = PatternDetector;