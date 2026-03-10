/** Configuration for the Discourse API client */
export interface DiscourseConfig {
  /** Base URL of the Discourse instance (e.g. https://forum.example.com) */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Username to act as */
  apiUsername: string;
}

/** Parameters for creating a new topic */
export interface CreateTopicParams {
  /** Topic title */
  title: string;
  /** Post body (Markdown or HTML) */
  raw: string;
  /** Category ID */
  categoryId: number;
  /** Optional tags */
  tags?: string[];
}

/** Parameters for creating a reply post */
export interface CreatePostParams {
  /** Topic ID to reply to */
  topicId: number;
  /** Post body */
  raw: string;
}

/** Parameters for updating a post */
export interface UpdatePostParams {
  /** Post ID to update */
  postId: number;
  /** New post body */
  raw: string;
}

/** A Discourse topic as returned by the API */
export interface DiscourseTopic {
  id: number;
  title: string;
  categoryId: number;
  tags: string[];
  createdAt: string;
  postsCount: number;
  views: number;
}

/** A Discourse post as returned by the API */
export interface DiscoursePost {
  id: number;
  topicId: number;
  raw: string;
  cooked: string;
  createdAt: string;
  updatedAt: string;
  username: string;
}
