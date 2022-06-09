import { Injectable, HttpException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly searchService: ElasticsearchService) {}

  async createIndex(indexName: string, body: object) {
    return this.searchService.index({
      index: indexName,
      body,
    });
  }

  async searchMulti(text: string, index: string, fields: string[]) {
    try {
      const data: any = await this.searchService.search({
        index,
        body: {
          query: {
            multi_match: {
              query: text,
              fields,
            },
          },
        },
      });
      if (!data.body.hits.hits) {
        throw new HttpException('No Result', 404);
      }
      const hits = data?.body?.hits?.hits;
      if (!hits) {
        return [];
      }
      return hits.map((item) => item._source);
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async searchMatch(text: string, index: string, field: string) {
    try {
      const data: any = await this.searchService.search({
        index,
        body: {
          query: {
            match: {
              [field]: text,
            },
          },
        },
      });
      if (!data.body.hits.hits) {
        throw new HttpException('No Result', 404);
      }
      const hits = data?.body?.hits?.hits;
      if (!hits) {
        return [];
      }
      return hits.map((item) => item._source);
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async searchTerm(text: string, index: string, field: string) {
    try {
      const data: any = await this.searchService.search({
        index,
        body: {
          query: {
            term: {
              [field]: text,
            },
          },
        },
      });
      if (!data.body.hits.hits) {
        throw new HttpException('No Result', 404);
      }
      const hits = data?.body?.hits?.hits;
      if (!hits) {
        return [];
      }
      return hits.map((item) => item._source);
    } catch (error) {
      console.log(error);
      return;
    }
  }

  // async updateIndex(index: string, field : string )
}
