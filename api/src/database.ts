import mongoose from 'mongoose';
import config from './config';

mongoose.connection.on('open', () => {
    console.log('🚀 Database connected');
});

mongoose.connection.on('error', (err) => {
    console.log('Error connecting to mongoose');
    console.log(err);
});

export default {
    connect: () => mongoose.connect(config.mongoUrl as string),
    disconnect: () => mongoose.disconnect(),
};
