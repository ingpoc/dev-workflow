import * as React from "react"

const Alert = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`rounded-lg border p-4 ${className}`} {...props} />
))
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`mt-2 text-sm ${className}`} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }