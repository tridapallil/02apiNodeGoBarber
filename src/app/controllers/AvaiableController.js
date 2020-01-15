import {
  startOfDay,
  endOfDay,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  format,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvaiableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const parsedDate = parseISO(date);

    const appointments = await Appointment.finddAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
    ];

    const avaiable = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(parsedDate, hour), minute),
        0
      );

      return {
        time,
        value,
        avaiable:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(avaiable);
  }
}

export default new AvaiableController();
