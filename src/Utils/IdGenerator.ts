export class IdGenerator {
	generateID(): string {
		return crypto.randomUUID();
	}
}
