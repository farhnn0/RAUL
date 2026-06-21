import 'dotenv/config';
import {db} from './configs/db.js';
//mengimport bcrypt untuk menghash password
import bcrypt from 'bcrypt';

const users = [
    {
        username: 'Harist',
        email: 'hhaerriats@gmail.com',
        password: await bcrypt.hash('hhhrest17',10),
        role: 'admin',
    },
        {
        username: 'Randi',
        email: 'Randi@gmail.com',
        password: await bcrypt.hash('Teguh127',10),
    }
];

//otomatis memberikan role customer
users.forEach(user => {
    if (!user.role) {
        user.role = 'customer'
    }
})

//seeding data
try{
    // Seeding Users
    let collection = db.collection('users');
    console.log('[seed]', 'Seeding Users...');
    const result = await collection.insertMany(users);
    console.log(result.insertedIds);
    console.log('[seed]', 'Seeding Users Done');
} catch(error){
    console.log('[seed]', 'Error: ', error);
}
process.exit();