// __tests__/applications/dto/create-patient.dto.spec.ts

// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePatientDto } from '../create-patient.dto';
import { Gender } from '../../../domains/entities/patient.entity';

// 2. MOCK DATA
const validBaseData = {
  nama_lengkap: '  Budi Santoso  ', // Test trim
  nik: '3201234567890123',
  email: '  Budi.Santoso@Email.com  ', // Test lowercase + trim
  no_hp: '0812 3456 7890', // Test whitespace removal
  tanggal_lahir: '1990-01-01',
  jenis_kelamin: Gender.MALE,
  alamat: 'Jl. Merdeka No. 1',
  riwayat_alergi: 'Tidak ada',
  riwayat_penyakit: 'Flu',
  catatan_khusus: 'VIP',
};

// 3. TEST SUITE
describe('CreatePatientDto', () => {
  // 4. SETUP AND TEARDOWN
  // DTO testing is mostly stateless, so no complex beforeEach needed.

  // 5. EXECUTE METHOD TESTS (General Validations)

  it('should validate successfully with complete valid data', async () => {
    const dto = plainToInstance(CreatePatientDto, validBaseData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should validate successfully with only required fields', async () => {
    const minimalData = {
      nama_lengkap: 'Siti Aminah',
    };

    const dto = plainToInstance(CreatePatientDto, minimalData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should transform data correctly (trim, lowercase, regex replace)', async () => {
    const dto = plainToInstance(CreatePatientDto, validBaseData);

    // Transformation assertions
    expect(dto.nama_lengkap).toBe('Budi Santoso'); // Trimmed
    expect(dto.email).toBe('budi.santoso@email.com'); // Lowercase + Trimmed
    expect(dto.no_hp).toBe('081234567890'); // Spaces removed
  });

  // 6. SUB-GROUP TESTS (Field Specific Validations)

  describe('nama_lengkap', () => {
    it('should fail if nama_lengkap is empty', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        nama_lengkap: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nama_lengkap');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if nama_lengkap is shorter than 3 chars', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        nama_lengkap: 'Al',
      });
      const errors = await validate(dto);

      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail if nama_lengkap is longer than 250 chars', async () => {
      const longName = 'a'.repeat(251);
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        nama_lengkap: longName,
      });
      const errors = await validate(dto);

      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('nik', () => {
    it('should fail if nik is not 16 digits (length check)', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        nik: '123',
      });
      const errors = await validate(dto);

      // Bisa kena length atau matches
      expect(errors[0].property).toBe('nik');
    });

    it('should fail if nik contains non-numeric characters', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        nik: '123456789012345a',
      });
      const errors = await validate(dto);

      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('email', () => {
    it('should fail if email format is invalid', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        email: 'budi-not-email',
      });
      const errors = await validate(dto);

      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('no_hp', () => {
    it('should fail if phone number format is invalid (e.g. too short)', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        no_hp: '081',
      });
      const errors = await validate(dto);

      expect(errors[0].property).toBe('no_hp');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail if phone number contains letters', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        no_hp: '08123456abc',
      });
      const errors = await validate(dto);

      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should accept valid formats (+62, 62, 0)', async () => {
      const cases = ['08123456789', '628123456789', '+628123456789'];

      for (const phone of cases) {
        const dto = plainToInstance(CreatePatientDto, {
          ...validBaseData,
          no_hp: phone,
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  describe('tanggal_lahir', () => {
    it('should fail if date string is invalid', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        tanggal_lahir: '01-01-1990',
      }); // Wrong format
      const errors = await validate(dto);

      expect(errors[0].property).toBe('tanggal_lahir');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });
  });

  describe('jenis_kelamin', () => {
    it('should fail if value is not a valid enum member', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        jenis_kelamin: 'ALIEN' as Gender,
      });
      const errors = await validate(dto);

      expect(errors[0].property).toBe('jenis_kelamin');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('optional text fields (limits)', () => {
    it('should validate maxLength for alamat', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        alamat: 'a'.repeat(501),
      });
      const errors = await validate(dto);
      expect(errors[0].property).toBe('alamat');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate maxLength for riwayat_alergi', async () => {
      const dto = plainToInstance(CreatePatientDto, {
        ...validBaseData,
        riwayat_alergi: 'a'.repeat(1001),
      });
      const errors = await validate(dto);
      expect(errors[0].property).toBe('riwayat_alergi');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});
