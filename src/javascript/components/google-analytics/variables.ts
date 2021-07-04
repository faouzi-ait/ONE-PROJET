export default {
  userDimensions: {
    default: (user) => ({}),
    'ae | demo': (user) => ({
      ...(user.id && {dimension1: user.id}),
      ...(user['user-type'] && {dimension2: user['user-type']}),
      ...(user.company?.name && {dimension3: user.company.name}),
      ...((user.regions || []).length > 0 && { dimension4: user.regions.map((t) => t.name).join(',')}),
      ...((user.territories || []).length > 0 && { dimension5: user.territories.map((t) => t.name).join(',')}),
    }),
  },
}

