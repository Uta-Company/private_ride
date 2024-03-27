import pgp from "pg-promise";
import RideDAO from "../../application/repository/RideDAO";
import Ride from "../../domain/Ride";
import Connection from "../database/Connection";

export default class RideDAODatabase implements RideDAO {

  constructor (private readonly connection: Connection) {}

  async save(ride: Ride): Promise<void> {
    await this.connection.query(
      "insert into ride (ride_id, passenger_id, from_lat, from_long, to_lat, to_long, status, date) values ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        ride.rideId,
        ride.passengerId,
        ride.from.getLat(),
        ride.from.getLong(),
        ride.to.getLat(),
        ride.to.getLong(),
        ride.getStatus(),
        ride.date,
      ]
    );
  }
  async update(ride: Ride): Promise<void> {
    await this.connection.query(
      "update ride set driver_id = $1, status = $2 where ride_id = $3",
      [ride.driverId, ride.getStatus(), ride.rideId]
    );
  }
  async getById(rideId: string): Promise<Ride> {
    const [rideData] = await this.connection.query(
      "select * from ride where ride_id = $1",
      [rideId]
    );
    return Ride.restore(rideData.ride_id, rideData.passenger_id, rideData.driver_id, rideData.status, parseFloat(rideData.from_lat), parseFloat(rideData.from_long), parseFloat(rideData.to_lat), parseFloat(rideData.to_long), rideData.date);;
  }

  async getActiveRidesByPassangerId(passengerId: string): Promise<any> {
    const ridesData = await this.connection.query(
      "select * from ride where passenger_id = $1 and status in ('requested', 'accepted', 'in_progress')",
      [passengerId]
    );
    return ridesData;
  }

  async getActiveRidesByDriverId(driverId: string): Promise<any> {
    const ridesData = await this.connection.query(
      "select * from ride where driver_id = $1 and status in ('accepted', 'in_progress')",
      [driverId]
    );
    return ridesData;
  }
}
