"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get doctor users
    const doctorUsers = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'doctor'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (doctorUsers.length < 2) {
      throw new Error(
        "Not enough doctor users found. Please run user seeders first."
      );
    }

    const doctors = [
      {
        id: uuidv4(),
        user_id: doctorUsers[0].id,
        license_number: "MD-RW-2023-001",
        specialization: "General Medicine",
        hospital_name: "Kigali University Teaching Hospital",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: doctorUsers[1].id,
        license_number: "MD-RW-2023-002",
        specialization: "Cardiology",
        hospital_name: "Rwanda Military Hospital",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("doctors", doctors);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("doctors", null, {});
  },
};
