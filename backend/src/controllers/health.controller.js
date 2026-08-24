const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Distributed Job Scheduler API is running",
  });
};

export{
  getHealth,
};
