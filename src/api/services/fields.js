import UserFields from './user/user.fields';
import PatientFields from './patient/patient.fields';
import DriverFields from './driver/driver.fields';

import TripsFields from './trips/trips.fields';
import RequestHandlerFields from './requestHandler/requestHandler.fields';
import AmbulanceFields from './ambulance/ambulance.fields';
import AssignAmbulanceFields from './assign.ambulance/assign.ambulance.fields';
import RequestsFields from './requests/requests.fields';
import BloodBankFields from './BloodBank/BloodBank.fields';
module.exports = {
  User: UserFields,
  Patient: PatientFields,
  Driver: DriverFields,
  Trips: TripsFields,
  Ambulance: AmbulanceFields,
  BloodBank: BloodBankFields,
  AssignAmbulance: AssignAmbulanceFields,
  Requests: RequestsFields,
  RequestHandler: RequestHandlerFields
};
