import { Injectable, HttpException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { query } from 'express';

@Injectable()
export class SearchService {
  constructor(private readonly searchService: ElasticsearchService) {}

  async createIndex(indexName: string, body: object) {
    return this.searchService.index({
      index: indexName,
      body,
    });
  }

  async searchMultiMatch(text: string, index: string, fields: string[]) {
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
          size: 10,
          query: {
            match: {
              [field]: { query: text, fuzziness: 'auto' },
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
  async searchTerms(texts: string[], index: string, field: string) {
    try {
      const data: any = await this.searchService.search({
        index,
        body: {
          query: {
            terms: {
              [field]: texts,
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

  async remove(key: string, value: string, index: string) {
    try {
      await this.searchService.deleteByQuery({
        index,
        body: {
          query: {
            term: {
              [key]: value,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async update(key: string, keyVal: string, body: any, index: string) {
    const script = Object.entries(body).reduce(
      (result, [k, v]) => `${result} ctx._source.${k}='${v}';`,
      '',
    );

    return this.searchService.updateByQuery({
      index,
      body: {
        query: {
          match: {
            [key]: keyVal,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }
}
