const argon2 = require('argon2');

const users = [
    {
        firstname: "Angelo Syrean",
        middlename: "Blanchard",
        lastname: "Bonifacio",
        email: "202210888@gordoncollege.edu.ph",
        password: "StrongPasswordtopre1125!",
        isAdmin: false
    },
    {
        firstname: "Giervan",
        middlename: "Melendes",
        lastname: "Sabalbero",
        email: "202210391@gordoncollege.edu.ph",
        password: "PogiNgaAko_123",
        isAdmin: true
    },
    {
        firstname: "Karl Bastian",
        middlename: "Cunanan",
        lastname: "Lacap",
        email: "202210003@gordoncollege.edu.ph",
        password: "@Reactfuck@ngul5r",
        isAdmin: false
    },
    {
        firstname: "Kenneth Gerald",
        middlename: "Elduayan",
        lastname: "Piangco",
        email: "202210103@gordoncollege.edu.ph",
        password: "Armi;aNgular22",
        isAdmin: true
    },
    {
        firstname: "Jhon Patrick",
        middlename: "Galino",
        lastname: "Dela Cruz",
        email: "202210150@gordoncollege.edu.ph",
        password: "Jypee@1827",
        isAdmin: false
    }
];

const hashPasswords = async (users) => {
    const hashedUsers = await Promise.all(users.map(async user => {
        user.password = await argon2.hash(user.password, 10);
        return user;
    }));
    return hashedUsers;
};

module.exports = { users, hashPasswords };
