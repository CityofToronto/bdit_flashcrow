import SpecialCasesDAO from '../db/SpecialCasesDAO';

const SpecialCasesController = [];

SpecialCasesController.push({
  method: 'GET',
  path: '/hacky-cases',
  options: {
    auth: false,
    description: 'Get all hacky cases.',
    tags: ['api'],
  },
  handler: async () => {
    const users = await SpecialCasesDAO.getSpecialCaseCentrelineIds();
    return users;
  },
});

SpecialCasesController.push({
  method: 'GET',
  path: '/caution-cases',
  options: {
    auth: false,
    description: 'Get all caution cases.',
    tags: ['api'],
  },
  handler: async () => {
    const users = await SpecialCasesDAO.getCautionableCentrelineIds();
    return users;
  },
});

export default SpecialCasesController;
