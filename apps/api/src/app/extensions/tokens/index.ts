import {
	type BinaryLike,
	createHmac,
	randomBytes,
	scrypt,
	timingSafeEqual,
} from 'crypto';

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const ENCODING = 'base64';
const SIGNING_SECRET = 'your-signing-secret';
function ascrypt(password: BinaryLike, salt: BinaryLike, keylen: number) {
	return new Promise<Buffer>((resolve, reject) => {
		scrypt(password, salt, keylen, (err, derivedKey) => {
			if (err) reject(err);
			resolve(derivedKey);
		});
	});
}

const hash = async (password: string) => {
	const salt = randomBytes(SALT_LENGTH);
	const derivedKey = await ascrypt(password, salt, KEY_LENGTH);
	return `${salt.toString(ENCODING)}.${derivedKey.toString(ENCODING)}`;
};

const compare = async (password: string, hash: string) => {
	const [saltString, hashString] = hash.split('.');
	const salt = Buffer.from(saltString, ENCODING);
	const hashBuffer = Buffer.from(hashString, ENCODING);

	const derivedKey = await ascrypt(password, salt, KEY_LENGTH);

	return timingSafeEqual(hashBuffer, derivedKey);
};

const sign = (data: string) => {
	const hmac = createHmac('sha256', SIGNING_SECRET);
	hmac.update(data);
	return hmac.digest(ENCODING);
};

const verifySignature = (data: string, signature: string) => {
	const expectedSignature = sign(data);
	return timingSafeEqual(
		Buffer.from(signature, ENCODING),
		Buffer.from(expectedSignature, ENCODING)
	);
};

const apiKey = async () => {
	const key = randomBytes(KEY_LENGTH / 2).toString('hex');
	const signedKey = sign(key);
	const hashedKey = await hash(key);
	return {
		key,
		signature: signedKey,
		signedKey: `${key}.${signedKey}`,
		hashedKey,
	};
};

const verifyApiKey = async (providedKey: string) => {
	const [key, signature] = providedKey.split('.');
	if (!verifySignature(key, signature)) {
		throw new Error('Invalid signature');
	}
	const storedHash = await hash(key); // This should actually be fetched from the database
	const isValid = await compare(key, storedHash);
	return isValid;
};
 