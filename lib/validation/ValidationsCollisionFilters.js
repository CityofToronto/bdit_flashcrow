const ValidationsCollisionFilters = {
  hoursOfDayStart: {
    startBeforeEnd(hoursOfDayStart, { hoursOfDayEnd }) {
      return hoursOfDayStart < hoursOfDayEnd;
    },
  },
  hoursOfDayEnd: {
    startBeforeEnd(hoursOfDayEnd, { hoursOfDayStart }) {
      return hoursOfDayStart < hoursOfDayEnd;
    },
  },
};

export default ValidationsCollisionFilters;
