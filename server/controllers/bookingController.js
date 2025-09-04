const Booking = require('../models/booking');

exports.getAll = async (req, res) => {
  const bookings = await Booking.findAll();
  res.json(bookings);
};

exports.getById = async (req, res) => {
  const booking = await Booking.findById(Number(req.params.id));
  if (!booking) return res.status(404).json({ error: 'Not found' });
  res.json(booking);
};

exports.create = async (req, res) => {
  const booking = await Booking.create(req.body);
  res.status(201).json(booking);
};

exports.update = async (req, res) => {
  const booking = await Booking.update(Number(req.params.id), req.body);
  res.json(booking);
};

exports.delete = async (req, res) => {
  await Booking.delete(Number(req.params.id));
  res.status(204).end();
};
