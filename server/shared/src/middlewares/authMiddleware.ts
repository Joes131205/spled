import { Injectable, NestMiddleware  } from "@nestjs/common";

@Injectable()
export class authMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction)
    {   
        next()
    }
}
