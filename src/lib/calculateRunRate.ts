export const calculateRunRate = (team: any): number => {
  let totalRunsScored: number =
    team.teamOneMatches.reduce(
      (acc: number, match: any) => acc + (match.teamOneScore || 0),
      0
    ) +
    team.teamTwoMatches.reduce(
      (acc: number, match: any) => acc + (match.teamTwoScore || 0),
      0
    );

  let totalOversFaced: number =
    team.teamOneMatches.reduce(
      (acc: number, match: any) => acc + (match.teamOneBalls || 0) / 6,
      0
    ) +
    team.teamTwoMatches.reduce(
      (acc: number, match: any) => acc + (match.teamTwoBalls || 0) / 6,
      0
    );

  return totalRunsScored / totalOversFaced;
};
