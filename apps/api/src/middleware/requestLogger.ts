import morgan from 'morgan'
import { Request } from 'express'

morgan.token('user', (req: Request) => req.user?.email ?? 'anonymous')
morgan.token('body', (req: Request) => JSON.stringify(req.body))

export const requestLogger = morgan(
  process.env.NODE_ENV === 'production'
    ? ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
    : ':method :url :status :response-time ms - :user'
)
