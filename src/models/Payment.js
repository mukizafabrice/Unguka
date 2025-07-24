const paymentSchema = new mongoose.Schema({
  productionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Production",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be a positive number"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
