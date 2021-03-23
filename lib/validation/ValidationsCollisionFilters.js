const ValidationsCollisionFilters = {
  hoursOfDay: {
    fromBeforeTo(hoursOfDay) {
      const [fromHour, toHour] = hoursOfDay;
      return fromHour < toHour;
    },
  },
};

export default ValidationsCollisionFilters;
