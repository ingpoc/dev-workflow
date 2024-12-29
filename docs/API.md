# Development Workflow API

## Pattern Management
```javascript
trackPattern(patternId, context)
getPattern(category, context)
savePattern(pattern)
```

## Context Management
```javascript
saveState(projectName, state)
loadState(projectName)
createCheckpoint()
```

## Project Commands
- `!load project-name` - Load project state
- `!status` - Show current status
- `!checkpoint "message"` - Create checkpoint
- `!pattern category` - Get recommended pattern