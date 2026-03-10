import type {
  DiscourseConfig,
  CreateTopicParams,
  CreatePostParams,
  UpdatePostParams,
  DiscourseTopic,
  DiscoursePost,
} from "./types.js";

/**
 * Lightweight client for the Discourse REST API.
 *
 * Supports creating topics, publishing posts, managing tags,
 * and retrieving content. Designed for automation pipelines.
 */
export class DiscourseClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: DiscourseConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.headers = {
      "Api-Key": config.apiKey,
      "Api-Username": config.apiUsername,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Discourse API error ${response.status} ${method} ${path}: ${text}`
      );
    }

    return response.json() as Promise<T>;
  }

  /** Create a new topic with an initial post */
  async createTopic(params: CreateTopicParams): Promise<DiscourseTopic> {
    const result = await this.request<Record<string, unknown>>(
      "POST",
      "/posts.json",
      {
        title: params.title,
        raw: params.raw,
        category: params.categoryId,
        tags: params.tags || [],
      }
    );

    return {
      id: result.topic_id as number,
      title: params.title,
      categoryId: params.categoryId,
      tags: params.tags || [],
      createdAt: result.created_at as string,
      postsCount: 1,
      views: 0,
    };
  }

  /** Create a reply post in an existing topic */
  async createPost(params: CreatePostParams): Promise<DiscoursePost> {
    const result = await this.request<Record<string, unknown>>(
      "POST",
      "/posts.json",
      {
        topic_id: params.topicId,
        raw: params.raw,
      }
    );

    return {
      id: result.id as number,
      topicId: params.topicId,
      raw: params.raw,
      cooked: result.cooked as string,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
      username: result.username as string,
    };
  }

  /** Update an existing post */
  async updatePost(params: UpdatePostParams): Promise<DiscoursePost> {
    const result = await this.request<{ post: Record<string, unknown> }>(
      "PUT",
      `/posts/${params.postId}.json`,
      {
        post: { raw: params.raw },
      }
    );

    return {
      id: params.postId,
      topicId: result.post.topic_id as number,
      raw: params.raw,
      cooked: result.post.cooked as string,
      createdAt: result.post.created_at as string,
      updatedAt: result.post.updated_at as string,
      username: result.post.username as string,
    };
  }

  /** Get a topic by ID */
  async getTopic(topicId: number): Promise<DiscourseTopic> {
    const result = await this.request<Record<string, unknown>>(
      "GET",
      `/t/${topicId}.json`
    );

    return {
      id: result.id as number,
      title: result.title as string,
      categoryId: result.category_id as number,
      tags: (result.tags as string[]) || [],
      createdAt: result.created_at as string,
      postsCount: result.posts_count as number,
      views: result.views as number,
    };
  }

  /** Get posts in a topic */
  async getTopicPosts(topicId: number): Promise<DiscoursePost[]> {
    const result = await this.request<{
      post_stream: { posts: Array<Record<string, unknown>> };
    }>("GET", `/t/${topicId}.json`);

    return result.post_stream.posts.map((p) => ({
      id: p.id as number,
      topicId,
      raw: (p.raw as string) || "",
      cooked: p.cooked as string,
      createdAt: p.created_at as string,
      updatedAt: p.updated_at as string,
      username: p.username as string,
    }));
  }
}
