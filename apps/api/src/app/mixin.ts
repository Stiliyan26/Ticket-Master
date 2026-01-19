import { Type } from '@nestjs/common';
import { Venue } from './domains/venues/entities/venue.entity';

export function WithSoftDelete<TBase extends Type>(Base: TBase) {
  return class extends Base {
    declare deletedAt: Date | null;

    softDelete() {
      this.deletedAt = new Date();
    }
  };
}

export function WithTimestamps<TBase extends Type>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();

    touch() {
      this.updatedAt = new Date();
    }
  };
}

export function WithAudit<TBase extends Type>(Base: TBase) {
  return class extends Base {
    createdBy?: string;
    updatedBy?: string;

    setCreator(userId: string) {
      this.createdBy = userId;
    }

    setUpdater(userId: string) {
      this.updatedBy = userId;
    }
  };
}

const FullFeatureVenue = WithAudit(WithSoftDelete(WithTimestamps(Venue)));

const venue = new FullFeatureVenue();
venue.softDelete();
venue.setCreator('12');
venue.touch();
