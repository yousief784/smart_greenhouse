import database from '../database';
import Admin from '../schema/adminSchema';
import User from '../schema/userSchema';

const user = {
    fullName: 'admin',
    isDeleted: false,
    _id: '634cb1879ff4ec5e761e933a',
    email: 'admin@admin.com',
    emailVerificationAt: '2022-10-17T01:36:07.552Z',
    // password: adminadmin
    salt: '59ea07d1eb3aa5cdc6693d15b406a0461f1c926e9464daf8695bf3526cd11ee6',
    hash: '5604708db5deb8e40275773e2638e973933a23502c2f60fb7d78b4d6cc08ed1bf9481afb5edf0267581f0d746d0d115cec49dafe1f9a5ea3f4754748b0e235a6fd4187c0109c0e728b02c374f59eddb40d25aca3fd8cf0aaf15ce09ffe41ecf0d7b8fa9a635429a2e85619df69ef47d75e4709fccfc86ded650951e00894156d3ce0b02e8d4f8d2c41cfc8208f195b6b16cff4f051f299ce4aaa6fa27ab59983cf093a84eeef9f3dcc5c455ae30bd01dee35bc3c98e285348e796d596176464b2779059a7a836fa9de57003e226f81b976b14f97927cec993240bd51577bef108517b4f5e4e2f48d94ffacfb9080f92442f7254d91a626349891fb43c62725bbc92eb4cbf086533208ef2560acaff628e8f4ba4d9e8f7b9833619201c78f8368be00ce12c54075b0e3239acffd1389debf670fe47c19fd8fcee261990095b5e8d872773e1feab1e94639c076aafd12d654d82afa75f17166f749f7428d300362581d86e71234600d5bd86290953a9bd7dbe051cfbf0ded886729d4e0dd8d7d8de65cabe88a4f83624c7d3ecc0f492737110d8e65c34757aa72a502d234cd740a583fb90069b4a082e29d390ed5734360fd028ffeeb36e9022eed84753cb3929c25c479e5d9c022534e1cab6b8f51ad66edf44882f25f3f08d8a466c2f2640083755f7abd9da8588acc3c262ad7c386682fa1a02390148e64b3afb96c8fa90b56',
};

const admin = () => {
    database.connect();
    let done = 0;

    for (let i = 0; i < 1; i++) {
        User.create(user).then((user) => {
            Admin.create({
                _id: '634f4e27fbecdac0f1b6bd55',
                user: user._id,
            }).then(() => {
                done++;
                if (done === 1) {
                    exit();
                }
            });
        });
    }

    const exit = () =>
        database.disconnect().then(() => {
            console.log('Database disconnect');
        });
};

admin();
