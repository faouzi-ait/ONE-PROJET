const createVideoName = (
  videoName: string,
  programmeName?: string,
  seriesName?: string,
  episodeName?: string,
) => {
  return [videoName, programmeName, seriesName, episodeName]
    .filter(Boolean)
    .join(' - ')
}

export default createVideoName