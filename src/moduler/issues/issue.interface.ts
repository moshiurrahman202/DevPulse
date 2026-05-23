export type TIssue = {
    title: string,
    description: string,
    type: string
};

export type TIssueQuery = {
  sort?: "newest"|"oldest";
  type?: "bug"|"feature_request";
  status?: "open"|"in_progress"|"resolved";
};