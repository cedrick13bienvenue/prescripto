"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = [
      // Doctors
      {
        id: uuidv4(),
        email: "dr.mukamana@medconnect.com",
        password_hash: hashedPassword,
        role: "doctor",
        full_name: "Dr. Alice Mukamana",
        phone: "+250788111111",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: "dr.uwimana@medconnect.com",
        password_hash: hashedPassword,
        role: "doctor",
        full_name: "Dr. Jean Uwimana",
        phone: "+250788222222",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Pharmacists
      {
        id: uuidv4(),
        email: "pharmacist1@medconnect.com",
        password_hash: hashedPassword,
        role: "pharmacist",
        full_name: "Mary Ingabire",
        phone: "+250788333333",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: "pharmacist2@medconnect.com",
        password_hash: hashedPassword,
        role: "pharmacist",
        full_name: "Paul Nsengimana",
        phone: "+250788444444",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Patients
      {
        id: uuidv4(),
        email: "patient1@medconnect.com",
        password_hash: hashedPassword,
        role: "patient",
        full_name: "Grace Uwamahoro",
        phone: "+250788555555",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: "patient2@medconnect.com",
        password_hash: hashedPassword,
        role: "patient",
        full_name: "Emmanuel Habimana",
        phone: "+250788666666",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("users", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "users",
      {
        email: {
          [Sequelize.Op.in]: [
            "dr.mukamana@medconnect.com",
            "dr.uwimana@medconnect.com",
            "pharmacist1@medconnect.com",
            "pharmacist2@medconnect.com",
            "patient1@medconnect.com",
            "patient2@medconnect.com",
          ],
        },
      },
      {}
    );
  },
};
