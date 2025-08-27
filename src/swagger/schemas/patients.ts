export default {
  Gender: {
    type: 'string',
    enum: ['male', 'female', 'other'],
    description: 'Patient gender'
  },
  VisitType: {
    type: 'string',
    enum: ['consultation', 'emergency', 'followup'],
    description: 'Type of medical visit'
  },
  PrescriptionStatus: {
    type: 'string',
    enum: ['pending', 'fulfilled', 'cancelled'],
    description: 'Status of prescription'
  },
  PatientRegistration: {
    type: 'object',
    required: ['email', 'password', 'fullName', 'dateOfBirth', 'gender'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'patient@example.com',
        description: 'Patient email address'
      },
      password: {
        type: 'string',
        minLength: 6,
        example: 'password123',
        description: 'Patient password (minimum 6 characters)'
      },
      fullName: {
        type: 'string',
        example: 'Jane Smith',
        description: 'Patient full name'
      },
      dateOfBirth: {
        type: 'string',
        format: 'date',
        example: '1990-01-01',
        description: 'Patient date of birth (YYYY-MM-DD)'
      },
      gender: {
        $ref: '#/components/schemas/Gender'
      },
      insuranceProvider: {
        type: 'string',
        example: 'RSSB',
        description: 'Insurance provider (optional)'
      },
      insuranceNumber: {
        type: 'string',
        example: 'INS123456',
        description: 'Insurance policy number (optional)'
      },
      allergies: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['Penicillin', 'Peanuts'],
        description: 'List of patient allergies (optional)'
      },
      existingConditions: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['Diabetes', 'Hypertension'],
        description: 'List of existing medical conditions (optional)'
      },
      emergencyContact: {
        type: 'string',
        example: 'John Smith',
        description: 'Emergency contact name (optional)'
      },
      emergencyPhone: {
        type: 'string',
        example: '+1234567890',
        description: 'Emergency contact phone (optional)'
      },
      phone: {
        type: 'string',
        example: '+1234567890',
        description: 'Patient phone number (optional)'
      }
    }
  },
  PatientProfile: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      referenceNumber: {
        type: 'string',
        example: 'PAT-20240101-0001',
        description: 'Unique patient reference number'
      },
      fullName: {
        type: 'string',
        example: 'Jane Smith'
      },
      dateOfBirth: {
        type: 'string',
        format: 'date',
        example: '1990-01-01'
      },
      gender: {
        $ref: '#/components/schemas/Gender'
      },
      insuranceProvider: {
        type: 'string',
        example: 'RSSB'
      },
      insuranceNumber: {
        type: 'string',
        example: 'INS123456'
      },
      allergies: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['Penicillin', 'Peanuts']
      },
      existingConditions: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['Diabetes', 'Hypertension']
      },
      emergencyContact: {
        type: 'string',
        example: 'John Smith'
      },
      emergencyPhone: {
        type: 'string',
        example: '+1234567890'
      },
      phone: {
        type: 'string',
        example: '+1234567890'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  MedicalVisit: {
    type: 'object',
    required: ['patientId', 'doctorId', 'visitDate', 'visitType', 'chiefComplaint'],
    properties: {
      patientId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Patient ID'
      },
      doctorId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174001',
        description: 'Doctor ID'
      },
      visitDate: {
        type: 'string',
        format: 'date',
        example: '2024-01-01',
        description: 'Date of visit (YYYY-MM-DD)'
      },
      visitType: {
        $ref: '#/components/schemas/VisitType'
      },
      chiefComplaint: {
        type: 'string',
        example: 'Severe headache and fever',
        description: 'Main reason for visit'
      },
      symptoms: {
        type: 'string',
        example: 'Headache, fever, nausea',
        description: 'Patient symptoms (optional)'
      },
      diagnosis: {
        type: 'string',
        example: 'Migraine with fever',
        description: 'Doctor diagnosis (optional)'
      },
      treatmentNotes: {
        type: 'string',
        example: 'Prescribed painkillers and rest',
        description: 'Treatment notes (optional)'
      },
      recommendations: {
        type: 'string',
        example: 'Follow up in 1 week if symptoms persist',
        description: 'Doctor recommendations (optional)'
      }
    }
  },
  PrescriptionItem: {
    type: 'object',
    required: ['medicineName', 'dosage', 'frequency', 'quantity'],
    properties: {
      medicineName: {
        type: 'string',
        example: 'Paracetamol',
        description: 'Name of the medicine'
      },
      dosage: {
        type: 'string',
        example: '500mg',
        description: 'Medicine dosage'
      },
      frequency: {
        type: 'string',
        example: '2 times daily',
        description: 'How often to take the medicine'
      },
      quantity: {
        type: 'integer',
        example: 20,
        description: 'Number of units to dispense'
      },
      instructions: {
        type: 'string',
        example: 'Take with food',
        description: 'Special instructions (optional)'
      }
    }
  },
  Prescription: {
    type: 'object',
    required: ['patientId', 'doctorId', 'visitId', 'diagnosis', 'items'],
    properties: {
      patientId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Patient ID'
      },
      doctorId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174001',
        description: 'Doctor ID'
      },
      visitId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174002',
        description: 'Medical visit ID'
      },
      diagnosis: {
        type: 'string',
        example: 'Migraine with fever',
        description: 'Medical diagnosis'
      },
      doctorNotes: {
        type: 'string',
        example: 'Patient should complete full course',
        description: 'Additional doctor notes (optional)'
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/PrescriptionItem'
        },
        minItems: 1,
        description: 'List of prescription items'
      }
    }
  },
  PatientSearch: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        example: 'Jane Smith',
        description: 'Search query (patient name or reference number)'
      }
    }
  }
};
