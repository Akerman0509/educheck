const handleServiceError = (res, error) => {
    // Regular expression to remove two sets of square brackets like [Error][Fail]
    res.status(404).send(error);
};

module.exports = {
    handleServiceError,
};
