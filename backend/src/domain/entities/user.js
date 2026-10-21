export default class User {
  constructor({
    id,
    fullName,
    email,
    phone = null,
    passwordHash,
    role = "USER",
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.phone = phone;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}