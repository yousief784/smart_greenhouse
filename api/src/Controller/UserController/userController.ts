import { Request, Response } from 'express';

class UserController {
    promoteInstructor = async (req: Request, res: Response) => {console.log(req.file);
    };
}

export default UserController;
