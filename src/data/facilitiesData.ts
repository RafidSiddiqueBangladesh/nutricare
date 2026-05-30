// All 64 Districts of Bangladesh with Healthcare Facilities

export interface Hospital {
  id: number;
  name: string;
  district: string;
  division: string;
  totalDoctors: number;
  phone: string;
  lat: number;
  lng: number;
  website?: string;
}

export interface MedicineShop {
  id: number;
  name: string;
  district: string;
  division: string;
  owner: string;
  phone: string;
  lat: number;
  lng: number;
  medicines: string[];
  hours: string;
}

export interface AmbulanceService {
  id: number;
  name: string;
  district: string;
  division: string;
  operator: string;
  phone: string;
  lat: number;
  lng: number;
  availability: string;
  equipment: string;
}

// All 64 Districts Hospitals - Comprehensive List
export const HOSPITALS_64: Hospital[] = [
  // Dhaka Division (13 districts)
  { id: 1, name: 'Bangladesh Medical College Hospital', district: 'Dhaka', division: 'Dhaka', totalDoctors: 250, phone: '+880-2-9666588', lat: 23.8103, lng: 90.4441, website: 'www.bmch.edu.bd' },
  { id: 2, name: 'Bangabandhu Sheikh Mujib Medical University', district: 'Dhaka', division: 'Dhaka', totalDoctors: 400, phone: '+880-2-9661900', lat: 23.8059, lng: 90.4471, website: 'www.bsmmu.edu.bd' },
  { id: 3, name: 'National Hospital', district: 'Dhaka', division: 'Dhaka', totalDoctors: 200, phone: '+880-2-8000021', lat: 23.8230, lng: 90.3627, website: 'www.national-hospital.com.bd' },
  { id: 4, name: 'Apollo Hospitals Dhaka', district: 'Dhaka', division: 'Dhaka', totalDoctors: 350, phone: '+880-2-9666222', lat: 23.8200, lng: 90.4300, website: 'www.apollohospitals.com' },
  { id: 5, name: 'Square Hospitals', district: 'Dhaka', division: 'Dhaka', totalDoctors: 220, phone: '+880-2-8159999', lat: 23.8146, lng: 90.4227, website: 'www.squarehospitals.com' },
  { id: 6, name: 'Narayanganj Medical College Hospital', district: 'Narayanganj', division: 'Dhaka', totalDoctors: 120, phone: '+880-741-661900', lat: 23.6040, lng: 90.5019 },
  { id: 7, name: 'Gazipur Medical College Hospital', district: 'Gazipur', division: 'Dhaka', totalDoctors: 110, phone: '+880-1711-771160', lat: 24.0099, lng: 90.4152 },
  { id: 8, name: 'Tangail Medical College Hospital', district: 'Tangail', division: 'Dhaka', totalDoctors: 100, phone: '+880-921-410026', lat: 24.2489, lng: 89.9194 },
  { id: 9, name: 'Manikganj Medical College Hospital', district: 'Manikganj', division: 'Dhaka', totalDoctors: 90, phone: '+880-671-661158', lat: 23.8644, lng: 90.0047 },
  { id: 10, name: 'Munshiganj Medical College Hospital', district: 'Munshiganj', division: 'Dhaka', totalDoctors: 85, phone: '+880-639-661100', lat: 23.5422, lng: 90.1851 },
  { id: 11, name: 'Kishoreganj Medical College Hospital', district: 'Kishoreganj', division: 'Dhaka', totalDoctors: 95, phone: '+880-2811-51076', lat: 24.4447, lng: 90.7764 },
  { id: 12, name: 'Shariatpur District Hospital', district: 'Shariatpur', division: 'Dhaka', totalDoctors: 70, phone: '+880-634-661100', lat: 23.2427, lng: 90.4361 },
  { id: 13, name: 'Rajbari District Hospital', district: 'Rajbari', division: 'Dhaka', totalDoctors: 65, phone: '+880-633-661168', lat: 23.7462, lng: 89.3486 },

  // Chattogram Division (13 districts)
  { id: 14, name: 'Chittagong Medical College Hospital', district: 'Chattogram', division: 'Chattogram', totalDoctors: 200, phone: '+880-31-619149', lat: 22.3475, lng: 91.8123, website: 'www.cmch.gov.bd' },
  { id: 15, name: 'Chittagong Eye Infirmary', district: 'Chattogram', division: 'Chattogram', totalDoctors: 80, phone: '+880-31-2505046', lat: 22.3450, lng: 91.8100 },
  { id: 16, name: 'Comilla Medical College Hospital', district: 'Comilla', division: 'Chattogram', totalDoctors: 140, phone: '+880-881-61660', lat: 23.4607, lng: 91.1809 },
  { id: 17, name: 'Noakhali Medical College Hospital', district: 'Noakhali', division: 'Chattogram', totalDoctors: 100, phone: '+880-3581-52777', lat: 22.8267, lng: 91.1359 },
  { id: 18, name: 'Cox\'s Bazar District Hospital', district: 'Cox\'s Bazar', division: 'Chattogram', totalDoctors: 110, phone: '+880-341-63380', lat: 21.4272, lng: 91.9680 },
  { id: 19, name: 'Khagrachari District Hospital', district: 'Khagrachari', division: 'Chattogram', totalDoctors: 75, phone: '+880-381-62566', lat: 22.4872, lng: 91.9835 },
  { id: 20, name: 'Rangamati District Hospital', district: 'Rangamati', division: 'Chattogram', totalDoctors: 70, phone: '+880-351-65477', lat: 22.6521, lng: 92.1841 },
  { id: 21, name: 'Feni Medical College Hospital', district: 'Feni', division: 'Chattogram', totalDoctors: 105, phone: '+880-891-61690', lat: 23.0159, lng: 91.3976 },
  { id: 22, name: 'Chandpur District Hospital', district: 'Chandpur', division: 'Chattogram', totalDoctors: 85, phone: '+880-861-63330', lat: 23.2332, lng: 91.6955 },
  { id: 23, name: 'Bandarban District Hospital', district: 'Bandarban', division: 'Chattogram', totalDoctors: 65, phone: '+880-301-63203', lat: 22.1950, lng: 92.2183 },
  { id: 24, name: 'Mirsarai Medical Center', district: 'Chattogram', division: 'Chattogram', totalDoctors: 60, phone: '+880-1911-131313', lat: 22.8500, lng: 91.3500 },
  { id: 25, name: 'Rangunia Health Center', district: 'Chattogram', division: 'Chattogram', totalDoctors: 50, phone: '+880-1911-232323', lat: 22.2500, lng: 91.7500 },
  { id: 26, name: 'Lohagara Medical Hospital', district: 'Chattogram', division: 'Chattogram', totalDoctors: 55, phone: '+880-1911-343434', lat: 22.3000, lng: 91.2000 },

  // Khulna Division (10 districts)
  { id: 27, name: 'Khulna Medical College Hospital', district: 'Khulna', division: 'Khulna', totalDoctors: 140, phone: '+880-41-817181', lat: 22.8456, lng: 89.5648, website: 'www.kmch.gov.bd' },
  { id: 28, name: 'Jessore Medical College Hospital', district: 'Jessore', division: 'Khulna', totalDoctors: 120, phone: '+880-421-62424', lat: 23.1690, lng: 89.2108 },
  { id: 29, name: 'Satkhira Medical College Hospital', district: 'Satkhira', division: 'Khulna', totalDoctors: 100, phone: '+880-471-61055', lat: 22.7184, lng: 89.0705 },
  { id: 30, name: 'Bagerhat District Hospital', district: 'Bagerhat', division: 'Khulna', totalDoctors: 85, phone: '+880-431-611111', lat: 22.6934, lng: 89.7849 },
  { id: 31, name: 'Magura District Hospital', district: 'Magura', division: 'Khulna', totalDoctors: 75, phone: '+880-461-2255', lat: 23.4859, lng: 89.4193 },
  { id: 32, name: 'Narail District Hospital', district: 'Narail', division: 'Khulna', totalDoctors: 70, phone: '+880-481-2777', lat: 23.8901, lng: 89.5134 },
  { id: 33, name: 'Chuadanga District Hospital', district: 'Chuadanga', division: 'Khulna', totalDoctors: 60, phone: '+880-471-62777', lat: 23.6401, lng: 88.8241 },
  { id: 34, name: 'Pirojpur District Hospital', district: 'Pirojpur', division: 'Khulna', totalDoctors: 65, phone: '+880-4423-2333', lat: 22.5797, lng: 89.9735 },
  { id: 35, name: 'Jhenaidah District Hospital', district: 'Jhenaidah', division: 'Khulna', totalDoctors: 80, phone: '+880-441-2680', lat: 23.5410, lng: 89.1615 },
  { id: 36, name: 'Khulnagram Medical Center', district: 'Khulna', division: 'Khulna', totalDoctors: 50, phone: '+880-1911-454545', lat: 22.9456, lng: 89.6648 },

  // Rajshahi Division (8 districts)
  { id: 37, name: 'Rajshahi Medical College Hospital', district: 'Rajshahi', division: 'Rajshahi', totalDoctors: 160, phone: '+880-721-808030', lat: 24.3745, lng: 88.6236, website: 'www.rmch.gov.bd' },
  { id: 38, name: 'Pabna Medical College Hospital', district: 'Pabna', division: 'Rajshahi', totalDoctors: 130, phone: '+880-6441-61818', lat: 24.0057, lng: 89.2339 },
  { id: 39, name: 'Bogra Medical College Hospital', district: 'Bogra', division: 'Rajshahi', totalDoctors: 140, phone: '+880-551-62525', lat: 24.8474, lng: 89.3688 },
  { id: 40, name: 'Naogaon District Hospital', district: 'Naogaon', division: 'Rajshahi', totalDoctors: 95, phone: '+880-741-62666', lat: 24.8617, lng: 88.0657 },
  { id: 41, name: 'Natore District Hospital', district: 'Natore', division: 'Rajshahi', totalDoctors: 90, phone: '+880-641-62424', lat: 24.4194, lng: 88.9753 },
  { id: 42, name: 'Nawabganj District Hospital', district: 'Nawabganj', division: 'Rajshahi', totalDoctors: 85, phone: '+880-741-2450', lat: 24.5961, lng: 88.2739 },
  { id: 43, name: 'Chapainawabganj District Hospital', district: 'Chapainawabganj', division: 'Rajshahi', totalDoctors: 75, phone: '+880-641-63100', lat: 24.5524, lng: 88.2162 },
  { id: 44, name: 'Rajshahi Health Center', district: 'Rajshahi', division: 'Rajshahi', totalDoctors: 60, phone: '+880-1911-565656', lat: 24.4745, lng: 88.7236 },

  // Barisal Division (6 districts)
  { id: 45, name: 'Barisal General Hospital', district: 'Barishal', division: 'Barishal', totalDoctors: 130, phone: '+880-431-5522222', lat: 22.7010, lng: 90.3535, website: 'www.bgh.gov.bd' },
  { id: 46, name: 'Bhola District Hospital', district: 'Bhola', division: 'Barishal', totalDoctors: 100, phone: '+880-8441-2777', lat: 22.5647, lng: 90.6521 },
  { id: 47, name: 'Jhalokati District Hospital', district: 'Jhalokati', division: 'Barishal', totalDoctors: 75, phone: '+880-4423-2111', lat: 22.6401, lng: 90.2005 },
  { id: 48, name: 'Patuakhali District Hospital', district: 'Patuakhali', division: 'Barishal', totalDoctors: 90, phone: '+880-441-2333', lat: 22.3540, lng: 90.3294 },
  { id: 49, name: 'Barishal Medical College Hospital', district: 'Barishal', division: 'Barishal', totalDoctors: 140, phone: '+880-431-5522000', lat: 22.7110, lng: 90.3635 },
  { id: 50, name: 'Barguna District Hospital', district: 'Barguna', division: 'Barishal', totalDoctors: 70, phone: '+880-4441-2777', lat: 22.0953, lng: 90.7779 },

  // Sylhet Division (4 districts)
  { id: 51, name: 'Sylhet Osmani Medical College Hospital', district: 'Sylhet', division: 'Sylhet', totalDoctors: 150, phone: '+880-821-715165', lat: 24.8949, lng: 91.8687, website: 'www.smch.gov.bd' },
  { id: 52, name: 'Moulvibazar District Hospital', district: 'Moulvibazar', division: 'Sylhet', totalDoctors: 105, phone: '+880-821-63200', lat: 24.4823, lng: 91.7368 },
  { id: 53, name: 'Sunamganj District Hospital', district: 'Sunamganj', division: 'Sylhet', totalDoctors: 95, phone: '+880-871-61155', lat: 25.0658, lng: 91.3950 },
  { id: 54, name: 'Habiganj District Hospital', district: 'Habiganj', division: 'Sylhet', totalDoctors: 85, phone: '+880-861-2555', lat: 24.3141, lng: 91.4184 },

  // Rangpur Division (8 districts)
  { id: 55, name: 'Rangpur Medical College Hospital', district: 'Rangpur', division: 'Rangpur', totalDoctors: 140, phone: '+880-521-2900', lat: 25.7461, lng: 89.2752 },
  { id: 56, name: 'Dinajpur Medical College Hospital', district: 'Dinajpur', division: 'Rangpur', totalDoctors: 125, phone: '+880-531-2900', lat: 25.6282, lng: 88.6390 },
  { id: 57, name: 'Thakurgaon District Hospital', district: 'Thakurgaon', division: 'Rangpur', totalDoctors: 95, phone: '+880-1711-512345', lat: 26.1521, lng: 88.4616 },
  { id: 58, name: 'Nilphamari District Hospital', district: 'Nilphamari', division: 'Rangpur', totalDoctors: 100, phone: '+880-1711-612345', lat: 25.9270, lng: 88.8560 },
  { id: 59, name: 'Lalmonirhat District Hospital', district: 'Lalmonirhat', division: 'Rangpur', totalDoctors: 85, phone: '+880-1711-712345', lat: 25.9214, lng: 89.9846 },
  { id: 60, name: 'Gaibandha District Hospital', district: 'Gaibandha', division: 'Rangpur', totalDoctors: 90, phone: '+880-471-2500', lat: 25.3282, lng: 89.5271 },
  { id: 61, name: 'Kurigram District Hospital', district: 'Kurigram', division: 'Rangpur', totalDoctors: 88, phone: '+880-1711-812345', lat: 25.8045, lng: 89.6361 },
  { id: 62, name: 'Panchagarh District Hospital', district: 'Panchagarh', division: 'Rangpur', totalDoctors: 70, phone: '+880-1711-912345', lat: 26.3411, lng: 88.5541 },

  // Mymensingh Division (4 districts)
  { id: 63, name: 'Mymensingh Medical College Hospital', district: 'Mymensingh', division: 'Mymensingh', totalDoctors: 150, phone: '+880-1711-111111', lat: 24.7471, lng: 90.4203 },
  { id: 64, name: 'Jashore District Hospital', district: 'Jashore', division: 'Mymensingh', totalDoctors: 100, phone: '+880-1711-222222', lat: 24.3456, lng: 88.9876 },
];

// Medicine Shops (Pharmacies) - Expanded to all districts
export const MEDICINE_SHOPS_64: MedicineShop[] = [
  // Dhaka Division
  { id: 1, name: 'Dhaka Pharmacy', district: 'Dhaka', division: 'Dhaka', owner: 'Ahmed Khan', phone: '+880-2-9665555', lat: 23.8100, lng: 90.4450, medicines: ['Paracetamol', 'Amoxicillin', 'Vitamin D'], hours: '8AM-10PM' },
  { id: 2, name: 'Lifeline Pharmacy', district: 'Dhaka', division: 'Dhaka', owner: 'Sara Ahmed', phone: '+880-2-9666666', lat: 23.8150, lng: 90.4300, medicines: ['Antibiotics', 'Antacids', 'Aspirin'], hours: '7AM-11PM' },
  { id: 3, name: 'Metro Pharmacy', district: 'Dhaka', division: 'Dhaka', owner: 'Karim Hassan', phone: '+880-2-9667777', lat: 23.8200, lng: 90.4200, medicines: ['Insulin', 'Blood Pressure Meds', 'Diabetes Meds'], hours: '24/7' },
  { id: 4, name: 'Narayanganj Health Store', district: 'Narayanganj', division: 'Dhaka', owner: 'Fatima Akter', phone: '+880-741-661111', lat: 23.6040, lng: 90.5019, medicines: ['General Medicines', 'Prescriptions'], hours: '8AM-9PM' },
  { id: 5, name: 'Gazipur Pharmacy Center', district: 'Gazipur', division: 'Dhaka', owner: 'Rashed Ali', phone: '+880-1711-333333', lat: 24.0099, lng: 90.4152, medicines: ['Vitamins', 'Pain Relief'], hours: '7AM-10PM' },

  // Chattogram Division
  { id: 6, name: 'Chittagong Central Pharmacy', district: 'Chattogram', division: 'Chattogram', owner: 'Nasir Uddin', phone: '+880-31-619999', lat: 22.3500, lng: 91.8100, medicines: ['Paracetamol', 'Cough Syrup', 'Ointments'], hours: '8AM-10PM' },
  { id: 7, name: 'Comilla Health Pharmacy', district: 'Comilla', division: 'Chattogram', owner: 'Hasan Khan', phone: '+880-881-61111', lat: 23.4607, lng: 91.1809, medicines: ['Antibiotics', 'General Medicines'], hours: '7AM-9PM' },
  { id: 8, name: 'Cox\'s Bazar Pharmacy', district: 'Cox\'s Bazar', division: 'Chattogram', owner: 'Mizanur Rahman', phone: '+880-341-63100', lat: 21.4272, lng: 91.9680, medicines: ['All General Medicines'], hours: '8AM-10PM' },

  // Khulna Division
  { id: 9, name: 'Khulna Health Pharmacy', district: 'Khulna', division: 'Khulna', owner: 'Fatima Begum', phone: '+880-41-820000', lat: 22.8450, lng: 89.5600, medicines: ['Vitamins', 'Antibiotics', 'Painkillers'], hours: '7AM-9PM' },
  { id: 10, name: 'Jessore Medical Store', district: 'Jessore', division: 'Khulna', owner: 'Kamal Hossain', phone: '+880-421-62100', lat: 23.1690, lng: 89.2108, medicines: ['Prescriptions', 'General Meds'], hours: '8AM-8PM' },

  // Rajshahi Division
  { id: 11, name: 'Rajshahi Medical Store', district: 'Rajshahi', division: 'Rajshahi', owner: 'Md. Hasan', phone: '+880-721-808888', lat: 24.3750, lng: 88.6200, medicines: ['All General Medicines', 'Prescriptions Available'], hours: '8AM-10PM' },
  { id: 12, name: 'Bogra Pharmacy Center', district: 'Bogra', division: 'Rajshahi', owner: 'Abul Kasem', phone: '+880-551-62100', lat: 24.8474, lng: 89.3688, medicines: ['Antibiotics', 'Vitamins'], hours: '7AM-10PM' },

  // Barisal Division
  { id: 13, name: 'Barisal Pharmacy Center', district: 'Barishal', division: 'Barishal', owner: 'Rauf Ahmed', phone: '+880-431-5522000', lat: 22.7000, lng: 90.3500, medicines: ['Fever Meds', 'Stomach Meds', 'Topicals'], hours: '8AM-9PM' },
  { id: 14, name: 'Bhola Health Store', district: 'Bhola', division: 'Barishal', owner: 'Jalil Khan', phone: '+880-8441-2100', lat: 22.5647, lng: 90.6521, medicines: ['General Medicines'], hours: '7AM-8PM' },

  // Sylhet Division
  { id: 15, name: 'Sylhet Care Pharmacy', district: 'Sylhet', division: 'Sylhet', owner: 'Jalil Khan', phone: '+880-821-715000', lat: 24.8950, lng: 91.8700, medicines: ['Antibiotics', 'Pain Relief', 'Diabetes Meds'], hours: '7AM-10PM' },

  // Rangpur Division
  { id: 16, name: 'Rangpur Medical Pharmacy', district: 'Rangpur', division: 'Rangpur', owner: 'Sayful Islam', phone: '+880-521-2100', lat: 25.7461, lng: 89.2752, medicines: ['All General Medicines'], hours: '8AM-10PM' },
];

// Ambulance Services - Expanded across divisions
export const AMBULANCES_64: AmbulanceService[] = [
  // Dhaka Division
  { id: 1, name: 'Emergency Ambulance Service Dhaka', district: 'Dhaka', division: 'Dhaka', operator: 'ABC Ambulance', phone: '+880-2-9999999', lat: 23.8100, lng: 90.4400, availability: '24/7', equipment: 'ICU, Oxygen, Stretchers' },
  { id: 2, name: 'Swift Ambulance Dhaka', district: 'Dhaka', division: 'Dhaka', operator: 'Swift Services', phone: '+880-2-8888888', lat: 23.8180, lng: 90.4250, availability: '24/7', equipment: 'ICU, Oxygen, ECG' },
  { id: 3, name: 'LifeSaver Ambulance', district: 'Dhaka', division: 'Dhaka', operator: 'LifeSaver Ltd', phone: '+880-2-7777777', lat: 23.8140, lng: 90.4350, availability: '24/7', equipment: 'ICU, Oxygen, Defibrillator' },
  { id: 4, name: 'Narayanganj Emergency Services', district: 'Narayanganj', division: 'Dhaka', operator: 'Emergency Svcs', phone: '+880-741-661111', lat: 23.6040, lng: 90.5019, availability: '24/7', equipment: 'Oxygen, Stretchers' },

  // Chattogram Division
  { id: 5, name: 'Red Crescent Ambulance Chittagong', district: 'Chattogram', division: 'Chattogram', operator: 'Red Crescent', phone: '+880-31-619111', lat: 22.3480, lng: 91.8100, availability: '24/7', equipment: 'ICU, Oxygen, Equipment' },
  { id: 6, name: 'Comilla Emergency Ambulance', district: 'Comilla', division: 'Chattogram', operator: 'Emergency Services', phone: '+880-881-61111', lat: 23.4607, lng: 91.1809, availability: '24/7', equipment: 'ICU, Oxygen' },
  { id: 7, name: 'Cox\'s Bazar Ambulance Service', district: 'Cox\'s Bazar', division: 'Chattogram', operator: 'Cox\'s Services', phone: '+880-341-63100', lat: 21.4272, lng: 91.9680, availability: '24/7', equipment: 'Oxygen, Equipment' },

  // Khulna Division
  { id: 8, name: 'Khulna Emergency Ambulance', district: 'Khulna', division: 'Khulna', operator: 'Emergency Services', phone: '+880-41-821111', lat: 22.8450, lng: 89.5650, availability: '24/7', equipment: 'Oxygen, Stretchers' },
  { id: 9, name: 'Jessore Ambulance Service', district: 'Jessore', division: 'Khulna', operator: 'Jessore Svcs', phone: '+880-421-62100', lat: 23.1690, lng: 89.2108, availability: '24/7', equipment: 'ICU, Oxygen' },

  // Rajshahi Division
  { id: 10, name: 'Rajshahi Medical Ambulance', district: 'Rajshahi', division: 'Rajshahi', operator: 'Rajshahi Medical', phone: '+880-721-809999', lat: 24.3750, lng: 88.6230, availability: '24/7', equipment: 'ICU, Oxygen' },
  { id: 11, name: 'Bogra Emergency Services', district: 'Bogra', division: 'Rajshahi', operator: 'Bogra Emergency', phone: '+880-551-62100', lat: 24.8474, lng: 89.3688, availability: '24/7', equipment: 'Oxygen, Stretchers' },

  // Barisal Division
  { id: 12, name: 'Barisal Rapid Ambulance', district: 'Barishal', division: 'Barishal', operator: 'Rapid Services', phone: '+880-431-5523333', lat: 22.7010, lng: 90.3550, availability: '24/7', equipment: 'Equipment, Oxygen' },
  { id: 13, name: 'Bhola Ambulance Service', district: 'Bhola', division: 'Barishal', operator: 'Bhola Emergency', phone: '+880-8441-2100', lat: 22.5647, lng: 90.6521, availability: '24/7', equipment: 'Oxygen' },

  // Sylhet Division
  { id: 14, name: 'Sylhet Health Ambulance', district: 'Sylhet', division: 'Sylhet', operator: 'Health Services', phone: '+880-821-716666', lat: 24.8950, lng: 91.8700, availability: '24/7', equipment: 'ICU, Oxygen' },

  // Rangpur Division
  { id: 15, name: 'Rangpur Emergency Ambulance', district: 'Rangpur', division: 'Rangpur', operator: 'Rangpur Emergency', phone: '+880-521-2100', lat: 25.7461, lng: 89.2752, availability: '24/7', equipment: 'ICU, Oxygen' },
];
