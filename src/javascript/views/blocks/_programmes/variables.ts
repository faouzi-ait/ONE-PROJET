export default {
  otherProps: {
    default: (props) => ({}),
    'itv': (props) => ({
      addToList: props.addToList,
      user: props.user
    }),
  }
}
