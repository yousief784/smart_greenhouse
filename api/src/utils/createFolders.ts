import fs from 'fs';
import path from 'path';

class CheckFoldersExists {
    private pathFromRoot = process.cwd() + '/public';

    foldersAreExists = () => {
        this.makeFolderIfNotExist('/uploads/instructors/cvs');
        this.makeFolderIfNotExist('/uploads/instructors/playlists');
        this.makeFolderIfNotExist('/uploads/images/userImage');
    };

    private makeFolderIfNotExist = (folderPath: string) => {
        const splitFoldersName = folderPath.split('/');

        splitFoldersName.map((folderName: string, idx: number) => {
            const pathCheck =
                this.pathFromRoot +
                `${splitFoldersName.slice(0, idx).join('/')}/${folderName}`;
            !fs.existsSync(pathCheck) && fs.mkdirSync(path.join(pathCheck));
        });
    };
}

export default CheckFoldersExists;
