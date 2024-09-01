const config = {}

config.NODE_ENV = 'development';

config.JWT_SECRET = 'your_secret_key_here'; // Секретный ключ
config.JWT_EXPIRES_IN = '1w'; // Время жизни токена

module.exports = config;