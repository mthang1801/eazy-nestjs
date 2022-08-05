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

  async searchMatchPhrase(
    text: string,
    index: string,
    field: string,
    skip: number = 0,
    limit: number = 10,
    sortArray: any[] = [],
  ) {
    let searchObj = {
      index,
      track_total_hits: true,
      body: {
        size: limit,
        from: skip,
        query: {
          match_phrase: {
            [field]: {
              query: text,
              slop: 2,
            },
          },
        },
      },
    };

    if (sortArray?.length) {
      let sortResult = [];

      sortArray.forEach((sortItem) => {
        let sortBy = Object.keys(sortItem)[0];
        let sortType: any = Object.values(sortItem)[0];

        if (['desc', 'asc'].includes(sortType.toLocaleLowerCase())) {
          sortResult.push({
            [sortBy]: {
              order: sortType.toLocaleLowerCase(),
              unmapped_type: 'date',
              missing: '_last',
            },
          });
        }
      });

      searchObj['body']['sort'] = sortResult;
    }

    console.log(JSON.stringify(searchObj, null, 4));

    try {
      const data: any = await this.searchService.search(searchObj);
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

  async searchMatch(
    text: string,
    index: string,
    field: string,
    skip: number = 0,
    limit: number = 10,
    sortArray: any[] = [],
  ) {
    let searchObj = {
      index,
      track_total_hits: true,
      body: {
        size: limit,
        from: skip,
        query: {
          match: {
            [field]: {
              query: text.toLowerCase(),
              fuzziness: 'auto',
              fuzzy_transpositions: true,
              minimum_should_match: '95%',
            },
          },
        },
      },
    };

    if (sortArray?.length) {
      let sortResult = [];

      sortArray.forEach((sortItem) => {
        let sortBy = Object.keys(sortItem)[0];
        let sortType: any = Object.values(sortItem)[0];

        if (['desc', 'asc'].includes(sortType.toLocaleLowerCase())) {
          sortResult.push({
            [sortBy]: {
              order: sortType.toLocaleLowerCase(),
              unmapped_type: 'date',
              missing: '_last',
            },
          });
        }
      });

      searchObj['body']['sort'] = sortResult;
    }

    console.log(JSON.stringify(searchObj, null, 4));

    try {
      const data: any = await this.searchService.search(searchObj);
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

  async searchSpanNear(
    text: string,
    index: string,
    field: string,
    skip: number = 0,
    limit: number = 10,
    sortArray: any[] = [],
  ) {
    let searchObj = {
      index,
      track_total_hits: true,
      body: {
        size: limit,
        from: skip,
        query: {
          span_near: {
            clauses: [
              {
                span_term: {
                  [field]: text,
                },
              },
              {
                span_term: {
                  [field]: text,
                },
              },
            ],
            slop: 2,
            in_order: true,
          },
        },
      },
    };

    if (sortArray?.length) {
      let sortResult = [];

      sortArray.forEach((sortItem) => {
        let sortBy = Object.keys(sortItem)[0];
        let sortType: any = Object.values(sortItem)[0];

        if (['desc', 'asc'].includes(sortType.toLocaleLowerCase())) {
          sortResult.push({
            [sortBy]: {
              order: sortType.toLocaleLowerCase(),
              unmapped_type: 'date',
              missing: '_last',
            },
          });
        }
      });

      searchObj['body']['sort'] = sortResult;
    }

    console.log(JSON.stringify(searchObj, null, 4));

    try {
      const data: any = await this.searchService.search(searchObj);
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

  async removeIndex(index_name) {
    this.searchService.indices.delete({
      index: index_name,
    });
  }

  async settingNumberOfShards(
    index: string,
    number_of_shards: number,
    number_of_replica_shards: number,
  ) {
    return this.searchService.index({
      index,
      body: {
        settings: {
          number_of_shards: number_of_shards,
          number_of_replicas: number_of_replica_shards,
        },
      },
    });
  }

  async checkExistIndex(index: string) {
    return this.searchService.indices.exists({
      index: index,
    });
  }

  async checkExistDocument(
    index: string,
    id: number,
    field: string,
  ): Promise<boolean> {
    try {
      let result: any = await this.searchService.search({
        index,
        body: {
          query: {
            term: {
              [field]: id,
            },
          },
        },
      });
      return result?.hits?.total?.value > 0 ? true : false;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response, error.status);
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
