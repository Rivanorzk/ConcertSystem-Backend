import bcrypt from "bcrypt"

const password = "superadmin1234"

bcrypt.hash(password, 10).then(console.log)