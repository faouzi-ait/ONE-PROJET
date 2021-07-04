export interface AccountManagerType {
  id: any;
  type: string;
  "first-name": any;
  "last-name": any;
  "users": UserType[];
};

export interface AnonymousAccessType {
  id: any;
  type: string;
  'emails': any
  'expires-after': any
  'message': any
  'name': any
  'view-count-sum': any
  'view-count-limit': any
  'anonymous-access-items': AnonymousAccessItemsType[]
  'list': ListType[]
  'programmes': ProgrammeType[]
  'series': SeriesType[]
  'videos': VideoType[]
};

export interface AnonymousAccessItemsType {
  id: any;
  type: string;
  'link': any
  'anonymous-access': AnonymousAccessType
  'programme': ProgrammeType
  'series': SeriesType
  'video': VideoType
};

export interface ApprovalType {
  id: any;
  type: string;
  "status": any;
  "created-at": any;
  "updated-at": any;
  "customer": UserType;
  "external-user": UserType;
};

export interface AssetAccessReportType {
  id: any;
  type: string;
  "name": any;
  "gallery": any;
  "restricted": any;
  "programme-name": any;
  "series-name": any;
  "parent": unknown;
  "asset-category": AssetCategoryType;
  "asset-items": AssetItemType[];
  "restricted-users": UserType[];
  "restricted-users-with-company-users": UserType[];
  "languages": LanguageType[];
  "restricted-companies": CompanyType[];
};

export interface AssetCategoryType {
  id: any;
  type: string;
  "name": any;
  "asset-materials-count": any;
};

export interface AssetItemType {
  id: any;
  type: string;
  "file-type": any;
  "file-size": any;
  "file": any;
  "file-identifier": any;
  'external-file-url':any
};

export interface AssetMaterialType {
  id: any;
  type: 'asset-materials';
  "name": any;
  "gallery": any;
  "restricted": any;
  "public-asset": boolean;
  "programme-name": any;
  "programme-slug": any;
  "series-name": any;
  "parent": ProgrammeType;
  "asset-category": AssetCategoryType;
  "asset-items": AssetItemType[];
  "restricted-users": UserType[];
  "restricted-companies": CompanyType[];
  "restricted-groups": GroupType[];
  "languages": LanguageType[];
};

export interface ProductionCompaniesProgrammesType {
  id: number;
  type: 'production-companies-programmes';
  'programme-id': number;
  position: number;
  'production-company-id': number;
  programme: ProgrammeType;
  'production-company': ProductionCompanyType;
}

export interface ProductionCompaniesSeriesType {
  id: number
  type: 'production-companies-series'
  'series-id': number
  position: number
  'production-company-id': number
  series: SeriesType
  'production-company': ProductionCompanyType
}

export interface AuthType {
  id: any;
  type: string;
  "title": any;
  "first-name": any;
  "last-name": any;
  "email": any;
  "job-title": any;
  "user-type": any;
  "company-name": any;
  "telephone-number": any;
  "mobile-number": any;
  "roles": RoleType[];
  "account-manager": UserType;
  "company": CompanyType;
  "territories": TerritoryType[];
  "genres": GenreType[];
};

export interface CalendarEventLocationRestrictionType {
  id: any;
  type: string;
  "start-date": any;
  "end-date": any;
  "start-time": any;
  "end-time": any;
  "calendar-event-location": CalendarEventLocationType;
  "users": UserType[];
};

export interface CalendarEventLocationType {
  id: any;
  type: string;
  "meal": any;
  "name": any;
  "nickname": any;
  "max-attendees": any;
  "calendar-event": CalendarEventType;
  "total-meals-bookable": any;
  "max-meals-available": any;
  "multi-meetings": any;
  "meals-allocation-stats": any;
  "calendar-event-location-restrictions": CalendarEventLocationRestrictionType[];
};

export interface CalendarEventMealSlotType {
  id: any;
  type: string;
  "start-hour-and-minute": any;
  "end-hour-and-minute": any;
  "calendar-event": CalendarEventType;
};

export interface CalendarEventOpeningTimeType {
  id: any;
  type: string;
  "start-time": any;
  "end-time": any;
  "calendar-event": CalendarEventType;
};

export interface CalendarEventType {
  id: any;
  type: string;
  "title": any;
  "start-time": any;
  "end-time": any;
  "status": any;
  closed: boolean;
  "timezone": any;
  "active": any;
  "invites-sent-at": any;
  "calendar-event-locations": CalendarEventLocationType[];
  "calendar-event-meal-slots": CalendarEventMealSlotType[];
  "calendar-event-opening-times": CalendarEventOpeningTimeType[];
  "calendar": CalendarType;
  "contact": UserType;
};

export interface CalendarType {
  id: any;
  type: string;
  "slot-length": any;
  "slots-array": any;
  "locations-array": any;
  "default-timezone": any;
  "slots": any;
  "enabled": any;
  "meetings": MeetingType[];
  "calendar-event-opening-times": CalendarEventOpeningTimeType[];
};

export interface CatalogueType {
  id: any;
  type: string;
  'banner-urls': any;
  'content-blocks': any;
  'name': any;
  'slug': any;
  'show-in-nav': any;
  'thumbnail-urls': any;
  'images': ImageType
  'programmes': ProgrammeType;
  'responsive-images': ResponsiveImageType;
}

export interface CollectionType {
  id: any;
  type: 'collections';
  "title": any;
  "introduction": any;
  "banner-image": any;
  "shareable": any;
  "sortable": any;
  "position": any;
  "published": boolean;
  "slug": any;
  "pages-count": any;
  "show-in-nav": any;
  "show-in-footer": any;
  "show-in-featured-nav": any;
  "show-in-mega-nav": any;
  "banner-text-color": any;
  "pages": PageType[];
  "content-positions": ContentPositionType;
  "meta-datum": MetaDatumType;
  "content-blocks": any;
  "default-order": any;
  "updated-at": any;
};

export interface CompanyType {
  id: any;
  type: 'companies'
  "name": any;
  "users-count": any;
  "users": UserType[];
};

export interface ContentPositionType {
  id: any;
  type: string;
  "content-positionable-id": any;
  "content-positionable-type": any;
  "navigation-context": any;
  "parent-id": any;
  "position": any;
  "updated-at": any;
  "content-positionable": any;
  "sub-items": ContentPositionType[];
  "parent": ContentPositionType;
};

export interface CustomAttributeTypeType {
  id: any;
  type: string;
  "name": any;
  "attribute-type": any;
  "related-type": any;
  "config": any;
  "position": any;
  "possible-values": any;
  "custom-attributes": CustomAttributeType[];
};

export interface CustomAttributeType {
  id: any;
  type: string;
  "name": any;
  "integer-value": any;
  "string-value": any;
  "value": any;
  "position": any;
  "custom-attribute-type": CustomAttributeTypeType;
  "related": unknown;
};

export interface CustomerType {
  id: any;
  type: string;
  "wistia-token": any;
  "wistia-password": any;
  "wistia-project": any;
  "wistia-enabled": any;
};

export interface DuplicateType {
  id: any;
  type: string;
  "name": any;
};

export interface EpisodeType {
  id: any;
  type: string;
  "name": any;
  "description": any;
  "position": any;
  "videos-count": any;
  "series": SeriesType;
  "videos": VideoType[];
};

export interface GenreScoreType {
  id: any;
  type: string;
  "page-views": any;
  "score": any;
  "genre": GenreType;
};

export interface GenreType {
  id: any;
  type: string;
  "name": any;
  "parent-id": any;
  "programmes-count": any;
  "active-programmes-count": any;
  "image": any;
  "sub-genres": GenreType[];
  "sub-genres-with-programmes-for-user": GenreType[];
  "parent": GenreType;
  "featured-programme": ProgrammeType;
  "show-in-registration": any;
  position: number;
};

export interface GroupType {
  id: any;
  type: 'groups';
  "name": any;
  "users-count": any;
  "users": UserType[];
};

export interface ImageType {
  id: any;
  type: string;
  'image': any;
  'image-crop': any;
  'image-data-uri': any;
  'name': any;
  'processing-errors': any;
  'variant': any;
  'news-article': NewsArticleType;
  'programme': ProgrammeType;
  'page': PageType;
  'catalogue': CatalogueType;
}

export interface LanguageType {
  id: any;
  type: string;
  "name": any;
  "programmes-count": any;
  "asset-materials": AssetMaterialType[];
};

export interface LikeType {
  id: any;
  type: string;
  "action": any;
  "parent": unknown;
};

export interface LimitedAccessProgrammeUserType {
  id: any;
  type: string;
  "limited-access-programme": ProgrammeType;
  "limited-access-user": UserType;
};

export interface ListProgrammeNoteType {
  id: any;
  type: string;
  "text": any;
  "created-at": any;
  "list-programme": ListProgrammeType;
};

export interface ListProgrammeType {
  id: any;
  type: 'list-programmes';
  "list-position": any;
  "notes-count": any;
  "screener": any;
  "programme-id": any;
  "like": LikeType;
  "programme": ProgrammeType;
  "list": ListType;
  "list-programme-notes": ListProgrammeNoteType[];
  "customer": UserType;
};

export interface ListSeriesNoteType {
  id: any;
  type: string;
  "text": any;
  "created-at": any;
  "list-series": ListSeryType;
};

export interface ListSeryType {
  id: any;
  type: 'list-series';
  "list-position": any;
  "notes-count": any;
  "screener": any;
  "series-id": any;
  "series": SeriesType;
  "list-series-notes": any[];
  "list": ListType;
  "like": LikeType;
};

export interface ListVideoNoteType {
  id: any;
  type: string;
  "text": any;
  "created-at": any;
  "list-video": ListVideoType;
};

export interface ListVideoType {
  id: any;
  type: 'list-videos'
  "list-position": any;
  "notes-count": any;
  "screener": any;
  "programme-id": any;
  "video-id": any;
  "video": VideoType;
  "list-video-notes": any[];
  "list": ListType;
  "like": LikeType;
};

export interface ListType {
  id: any;
  type: string;
  "name": any;
  "programmes-count": any;
  "programmes-count-without-restricted": any;
  "videos-count": any;
  "videos-count-without-restricted": any;
  "series-count": any;
  "global": any;
  "meeting-list": any;
  "updated-at": any;
  "images": any;
  "list-elements": any;
  "list-programmes": ListProgrammeType[];
  "list-videos": ListVideoType[];
  "list-series": ListSeryType[];
  "user": UserType;
  "meeting": MeetingType;
  "customer": UserType;
};

export interface MarketingActivityType {
  id: any;
  type: string;
  "date": any;
  "description": any;
  "marketing-category": MarketingCategoryType;
  "programmes": ProgrammeType[];
};

export interface MarketingCategoryType {
  id: any;
  type: string;
  "name": any;
  "marketing-activities-count": any;
};

export interface MeetingAttendeeType {
  id: any;
  type: string;
  "first-name": any;
  "last-name": any;
  "company": any;
  "job-title": any;
  "email": any;
  "status": any;
  "vip": any;
  "user": UserType;
};

export interface MeetingNoteType {
  id: any;
  type: string;
  "text": any;
  "pre-meeting-note": any;
  "created-at": any;
  "updated-at": any;
  "meeting": MeetingType;
  "customer": UserType;
};

export interface MeetingType {
  id: any;
  type: string;
  "client-details": any;
  "title": any;
  "timezone": any;
  "start-time": any;
  "end-time": any;
  "description": any;
  "location": any;
  "source-list-id": any;
  "meeting-details": any;
  "screener-message": any;
  "state": any;
  "critical": any;
  "has-meeting-notes": any;
  "is-meal-slot": any;
  "is-event-meeting": any;
  "meeting-attendees-count": any;
  "owner-full-name": any;
  "checked-in": any;
  "screener-email-address": any;
  "calendar-event-location-id": any;
  "list-name": any;
  'virtual': boolean;
  'virtual-bg-image': any;
  'remove-virtual-bg-image': any;
  'chat-enabled': boolean;
  'conference': boolean;
  "customer": CustomerType;
  "owner": UserType;
  "client": UserType;
  "list": ListType;
  "source-list": ListType;
  "meeting-notes": MeetingNoteType[];
  "meeting-attendees": MeetingAttendeeType[];
  "calendar-event": CalendarEventType;
  "calendar-event-location": CalendarEventLocationType;
  "calendar-event-meal-slot": CalendarEventMealSlotType;
  "meeting-followups": MeetingFollowupType[];
};

export interface MeetingFollowupType {
  id: any;
  email: string;
  message: string;
  /** A date time */
  'sent-at': string;
  'send-to-owner': boolean;
  'authorize-email': boolean;
  'authorize-attendees': boolean;
  meeting: MeetingType;
  list: ListType;
  'send-to-attendees': string;
}

export interface MetaDatumType {
  id: any;
  type: string;
  "title": any;
  "keywords": any;
  "description": any;
  "programme": ProgrammeType;
  "page": PageType;
  "collection": CollectionType;
};

export interface NewsArticleType {
  id: any;
  type: string;
  "content-blocks": any;
  "enable-sharing": any;
  "featured": any;
  "introduction": any;
  "publish-date": any;
  "slug": any;
  "status": any;
  "title": any;
  "images": ImageType[];
  "news-categories": NewsCategoryType[];
  "page-images": PageImageType[];
  "meta-datum": MetaDatumType;
  "responsive-images": ResponsiveImageType[];
  "category": number;
}

export interface NewsArticleSearchResultType {
  id: any;
  type: string;
  'introduction-highlight': any;
  'title': any;
  'title-highlight': any;
  'news-article': NewsArticleType;
}

export interface NewsCategoryType {
  id: any;
  type: string;
  'name': any;
  'position': any;
  'news-articles': NewsCategoryType[];
}

export interface PageImageType {
  id: any;
  type: string;
  "file": any;
  "filename": any;
};

export interface PageType {
  id: any;
  type: 'pages';
  "title": any;
  "introduction": any;
  "banner": any;
  "banner-urls": any;
  "thumbnail": any;
  "published-at": any;
  "shareable": any;
  "position": any;
  "content-blocks": any;
  "published": any;
  "private-page": boolean;
  "slug": any;
  "show-in-nav": any;
  "show-in-featured-nav": any;
  "show-in-mega-nav": any;
  "show-in-footer": any;
  "banner-text-color": any;
  "page-images": PageImageType[];
  "collection": CollectionType;
  "content-positions": ContentPositionType;
  "meta-datum": MetaDatumType;
  "updated-at": any;
  "page-type": any;
};

export interface PassportType {
  id: any;
  type: string;
};

export interface PassportContentType {
  id: any;
  type: string;
  'active': any;
  'content-blocks': any;
  'description': any;
  'name': any;
  'position': any;
  'market': any;
};

export interface PasswordType {
  id: any;
  type: string;
  "password-token": any;
  "password": any;
  "password-confirmation": any;
  "email": any;
};

export interface PrivateVideoAccessType {
  id: any;
  type: string;
  "expiry-date": any;
  "video-id": any;
  "slug": any;
  "password": any;
  "created-at": any;
};

export interface PrivateVideoViewType {
  id: any;
  type: string;
  "video-id": any;
  "password": any;
  "slug": any;
  "video": VideoType;
};

export interface ProductionCompanyType {
  id: any;
  type: string;
  "background-image": any;
  "country": any;
  "external-url": any;
  "intro": any;
  "logo": any;
  "name": any;
  "programmes-count": any;
  "video": VideoType;
};

export interface ProgrammeAlternativeTitleType {
  id: any;
  type: string;
  "name": any;
  position: number;
  "programme-id": any;
  "programme": ProgrammeType;
};

export interface ProgrammeBroadcasterType {
  id: any;
  type: string;
  position: any;
  programme: ProgrammeType;
  broadcaster: BroadcasterType;
}

export interface ProgrammeDuplicateType {
  id: any;
  type: string;
  "programme-id": any;
  "duplicate-id": any;
};

export interface ProgrammeHighlightCategoryType {
  id: any;
  type: string;
  "genre-id": any;
  "name": any;
  "position": any;
  "programme-highlights": ProgrammeHighlightType[];
  "genre": GenreType;
  "programmes": ProgrammeType[];
  "programme-highlight-page": ProgrammeHighlightPageType;
};

export interface ProgrammeHighlightType {
  id: any;
  type: string;
  "position": any;
  "programme-highlight-category-id": any;
  "programme-id": any;
  "programme": ProgrammeType;
  "programme-highlight-category": ProgrammeHighlightCategoryType;
  "programme-highlight-page": ProgrammeHighlightPageType;
};

export interface ProgrammeHighlightPageType {
  id: any;
  type: string;
  "banner-urls": any;
  "position": any;
  "title": any;
  "programme-highlight-categories": ProgrammeHighlightCategoryType[];
  "programme-highlights": ProgrammeHighlightType[];
  "responsive-images": ResponsiveImageType[];
  "parent-highlight-page": ProgrammeHighlightPageType;
  "programme-highlight-pages": ProgrammeHighlightPageType[];
};

export interface ProgrammeSearchResultType {
  id: any;
  type: string;
  "title": any;
  "highlight": any;
  "title-highlight": any;
  "introduction-highlight": any;
  "description-highlight": any;
  "programme": ProgrammeType;
};

export interface ProgrammeTalentType {
  id: any;
  'summary': string
  'talent': TalentType;
  'talent-type': TalentTypeType;
  'programme': ProgrammeType;
};

export interface ProgrammeTypeType {
  id: any;
  name: any;
  'programme': ProgrammeType;
  'user': UserType;
};

export interface ProgrammeViewType {
  id: any;
  type: string;
  "programme-id": any;
  "time-spent": any;
  "programme": ProgrammeType;
};

export interface ProgrammeType {
  id: any;
  "type": "programmes";
  "title": any;
  "slug": any;
  "introduction": any;
  "description": any;
  "production-start": any;
  "production-end": any;
  "meta-description": any;
  "short-description": any;
  "active": any;
  "active-series-counter": any;
  "number-of-series": any;
  "number-of-episodes": any;
  "manual-number-of-series": any;
  "manual-number-of-episodes": any;
  "series-count": any;
  "banner": any;
  "thumbnail": any;
  "asset-materials-count": any;
  "title-with-genre": any;
  "data": any;
  "restricted": any;
  "content-blocks": any;
  "has-assets": any;
  "pdf-id": any;
  "pdf-name": any;
  "videos-count": any;
  "external-id": any;
  "promo-video-id": any;
  "logo": any;
  "remove-thumbnail": any;
  "remove-banner": any;
  "remove-logo": any;
  "show-related-programmes": any;
  "publish-date": any;
  "custom-attributes": CustomAttributeType[];
  "genres": GenreType[];
  "qualities": QualityType[];
  "production-companies": ProductionCompanyType[];
  "series": SeriesType[];
  "active-series": SeriesType[];
  "episodes": EpisodeType[];
  "languages": LanguageType[];
  "restricted-users": UserType[];
  "restricted-companies": CompanyType[];
  "restricted-groups": GroupType[];
  "page-images": PageImageType[];
  "videos": VideoType[];
  "programme-alternative-titles": ProgrammeAlternativeTitleType[];
  "related-programmes": ProgrammeType[];
  "programme-talents": ProgrammeTalentType[];
  "programme-type": ProgrammeTypeType;
  "production-companies-programmes": ProductionCompaniesProgrammesType[];
  "production-companies-series": ProductionCompaniesSeriesType[]
  "meta-datum": MetaDatumType;
  "updatable": boolean;
  "video-banner"?: VideoType;
  "data-sync"?: boolean;
  "visibility": VisibilityType;
  'catalogues': CatalogueType[];
  "format": ProgrammeType,
  "format-programmes": ProgrammeType[]
};

export interface QualityType {
  id: any;
  type: string;
  "name": any;
};

export interface RegionType {
  id: any
  type: string
  'name': any
  'users-count': any
  'users': UserType[]
};

export interface ReportType {
  id: any;
  type: string;
};

export interface ResponsiveImageType {
  id: any;
  type: string;
  'default-image': any
  'large': any
  'large-crop': any
  'large-data-uri': any
  'medium': any
  'medium-crop': any
  'medium-data-uri': any
  'name': any
  'processing-errors': any
  'remote-urls': any
  'small': any
  'small-crop': any
  'small-data-uri': any
  'variant': any
  'xlarge': any
  'xlarge-crop': any
  'xlarge-data-uri': any
  'collection': CollectionType
  'news-article': NewsArticleType
  'page': PageType
  'programme': ProgrammeType;
  'catalogue': CatalogueType;
}

export interface RestrictedAssetMaterialCompanyType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-asset-material": AssetMaterialType;
  "restricted-company": CompanyType;
};

export interface RestrictedAssetMaterialGroupType {
  id: any;
  "expires-after": any;
  "restricted-asset-material": AssetMaterialType;
  "restricted-group": GroupType;
};

export interface RestrictedAssetMaterialUserType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-asset-material": AssetMaterialType;
  "restricted-user": UserType;
};

export interface RestrictedProgrammeCompanyType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-programme": ProgrammeType;
  "restricted-company": CompanyType;
};

export interface RestrictedProgrammeGroupType {
  id: any;
  "expires-after": any;
  "restricted-programme": ProgrammeType;
  "restricted-group": GroupType;
};

export interface RestrictedProgrammeUserType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-programme": ProgrammeType;
  "restricted-user": UserType;
};

export interface RestrictedSeriesCompanyType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-series": SeriesType;
  "restricted-company": CompanyType;
};

export interface RestrictedSeriesGroupType {
  id: any;
  "expires-after": any;
  "restricted-series": SeriesType;
  "restricted-group": GroupType;
};

export interface RestrictedSeriesUserType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-series": SeriesType;
  "restricted-user": UserType;
};

export interface RestrictedVideoCompanyType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-video": VideoType;
  "restricted-company": CompanyType;
};

export interface RestrictedVideoGroupType {
  id: any;
  "expires-after": any;
  "restricted-video": VideoType;
  "restricted-group": GroupType;
};

export interface RestrictedVideoUserType {
  id: any;
  type: string;
  "expires-after": any;
  "restricted-video": VideoType;
  "restricted-user": UserType;
};

export interface RoleType {
  id: any;
  type: string;
  "name": any;
  "permissions": any;
  "users": UserType[];
};

export interface SearchType {
  id: any;
  type: string;
  "query": any;
  "programmes-highlighted": any;
  "programmes-associated": any;
};

export interface SeriesSearchResultType {
  id: any;
  type: string;
  "name": any;
  series: SeriesType;
};

export interface SeriesBroadcasterType {
  id: any;
  type: string;
  position: any;
  series: SeriesType;
  broadcaster: BroadcasterType;
}

export interface SeriesType {
  id: any;
  type: string;
  "active": any;
  "asset-materials-count": any;
  "data": any;
  "description": any;
  "episodes-count": any;
  "has-assets": any;
  "has-description": any;
  "image": any;
  "name": any;
  "position": any;
  "restricted": any;
  "show-in-programme-description": any;
  "short-description": any;
  "videos-count": any;
  "custom-attributes": CustomAttributeType[];
  "restricted-users": UserType[];
  "restricted-companies": CompanyType[];
  "restricted-groups": GroupType[];
  "episodes": EpisodeType[];
  "videos": VideoType[];
  "programme": ProgrammeType;
  "series-talents": SeriesTalentType[];
  'programme-title-with-genre'?: string;
};

export interface TalentType {
  id: any;
  "firstname"?: string;
  "surname"?: string;
  "full-name": string;
};

export interface TalentTypeType {
  id: any;
  "name": any;
};

export interface SeriesTalentType {
  id: any;
  'summary': string
  'series': SeriesType
  'talent': TalentType
  'talent-type': TalentTypeType
};

export interface TeamDepartmentType {
  id: any;
  type: string;
  "name": any;
};

export interface TeamMemberType {
  id: any;
  type: string;
  "first-name": any;
  "last-name": any;
  "email": any;
  "job-title": any;
  "phone": any;
  "bio": any;
  "image": any;
  "manager": any;
  "position": any;
  "team-region": TeamRegionType;
  "team-department": TeamDepartmentType;
  "team": TeamType;
};

export interface TeamRegionType {
  id: any;
  type: string;
  "name": any;
};

export interface TeamType {
  id: any;
  type: string;
  "name": any;
};

export interface TerritoryType {
  id: any;
  type: string;
  "name": any;
  "users-count": any;
  "users": UserType[];
};

export interface TweetType {
  id: any;
  type: string;
  "created-at": any;
  "full-text": any;
  "user": UserType;
};

export interface UserProgrammeType {
  id: any;
  type: string;
  "programme": ProgrammeType;
};

export interface UserType {
  id: any;
  type: 'users';
  "title": any;
  "has-production-companies": boolean;
  "first-name": any;
  "last-name": any;
  "full-name": any;
  "email": any;
  "company-name": any;
  "created-at": any;
  "job-title": any;
  "telephone-number": any;
  "password": any;
  "password-confirmation": any;
  "user-type": any;
  "all-programmes-access": any;
  "suspended": any;
  "approval-status": any;
  "g-recaptcha-response": any;
  "meeting-attendee-id": any;
  "disable-registration-emails": any;
  "disable-approval-emails": any;
  "image": any;
  "remove-image": any;
  "mobile-number": any;
  "lists": ListType[];
  "account-manager": UserType;
  "company": CompanyType;
  "roles": RoleType[];
  "genres": GenreType[];
  "programmes": ProgrammeType[];
  "territories": TerritoryType[];
};

export interface VideoDownloadLinkType {
  id: any;
  type: string;
  "uid": any;
  "video_id": any;
  "downloaded-at": any;
  "video": VideoType;
};

export interface VideoSearchResultType {
  id: any;
  type: string;
  "name": any;
  "name-highlight": any;
  "video": VideoType;
};

export interface UserSearchResultType {
  id: any
  type: string
  'first-name': string
  'last-name': string
  'email': string
  'user': UserType
};

export interface AssetMaterialSearchResultType {
  id: any;
  type: string;
  "name": any;
  'asset-material': AssetMaterialType
};

export interface VideoViewType {
  id: any;
  "video"?: VideoType;
  "mp4-url"?: any;
  "video-id"?: any;
  'reporting-type'?: 'video_banner' | 'virtual_screening' | 'content_block' | null;
  "time-viewed": number;
  /** A datetime */
  "time-elapsed-updated-at"?: string;
  "time-elapsed"?: number;
};

export type VisibilityType = 'visible' | 'web_only' | 'app_only'

export interface VideoType {
  id: any;
  type: string;
  "name": any;
  "position": any;
  "mp4-url": any;
  "wistia-id": any;
  "brightcove-id": any;
  "episode-id": any;
  "poster": any;
  "wistia-thumbnail-url": any;
  "knox-uuid": any;
  "parent-id": any;
  "parent-type": any;
  "programme-id": any;
  "programme-name": any;
  "programme-slug": any;
  "series-id": any;
  "series-name": any;
  "episode-name": any;
  "public-video": any;
  "parent": unknown;
  "restricted": any;
  "restricted-users": UserType[];
  "restricted-companies": CompanyType[];
  "restricted-groups": GroupType[];
  "private-video-accesses": PrivateVideoAccessType[];
  'programme-title-with-genre'?: string;
  'languages': LanguageType[];
  'external-id'?: string
  'jwplayer-id': any
  'visibility': VisibilityType
  'video-type': VideoTypesType
  "upload-status": any;
  'downloadable': any
  'comcast-platform-id': string
};

export interface VideoTypesType {
  id: any;
  type: string;
  "name": any;
  "videos-count"?: any;
  "video": VideoType[];
};

export interface BroadcasterType {
  id: any
  'name': any
  'external-id': any
  'programmes': ProgrammeType[]
  'series': SeriesType[]
}

export interface BrightcoveAccountType {
  id: any
  'brightcove-account-id': any
  'brightcove-client-id': any
  'brightcove-enabled': any
  'brightcove-secret': any
  'default-ingest-profile': any
  player: any
}

export interface WistiaAccountType {
  id: any
  "wistia-token": any
  'wistia-enabled': any
  'wistia-password': any
  'wistia-project': any
}

export interface KnoxAccountType {
  id: any
  'api-key': any
  'knox-client-id': any
  'knox-client-secret': any
  'knox-enabled': any
  'password': any
  'username': any
}
export interface ImpersonatedUserType {
  id: string;
  token?: string;
  user: Partial<UserType>;
}

export interface VirtualMeetingAttendeeType {
  id: any;
  type: string;
  'attendee-status': any;
  'attendee-type': any;
  'jitsi-jwt': any;
  'jwt': any;
  'name': any;
  'label': any;
  'virtual-meeting': VirtualMeetingType;
  'user': UserType;
};


export interface VirtualMeetingChatMessageType {
  id: any;
  type: string;
  'body': any;
  'virtual-meeting': VirtualMeetingType;
  'attendee': VirtualMeetingAttendeeType;
};

export interface VirtualMeetingType {
  id: any;
  type: string;
  'background-image': any;
  'chat-enabled': any;
  'conference': any;
  'end-time': any;
  'finished-at': any;
  'host': any;
  'labels': any;
  'live': any;
  'room-key': any;
  'start-time': any;
  'started-at': any;
  'title': any;
  'token': any;
  'viewport': any;
  'meeting': MeetingType;
  'attendees': VirtualMeetingAttendeeType;
  'chat-messages': VirtualMeetingChatMessageType;
};

export interface Models {
  "account-managers": AccountManagerType;
  "anonymous-accesses": AnonymousAccessType;
  "anonymous-access-items": AnonymousAccessItemsType;
  "approvals": ApprovalType;
  "asset-access-reports": AssetAccessReportType;
  "asset-categories": AssetCategoryType;
  "asset-items": AssetItemType;
  "asset-materials": AssetMaterialType;
  "asset-material-search-results": AssetMaterialSearchResultType;
  "auths": AuthType;
  "brightcove-accounts": BrightcoveAccountType;
  "broadcasters": BroadcasterType
  "calendar-event-location-restrictions": CalendarEventLocationRestrictionType;
  "calendar-event-locations": CalendarEventLocationType;
  "calendar-event-meal-slots": CalendarEventMealSlotType;
  "calendar-event-opening-times": CalendarEventOpeningTimeType;
  "calendar-events": CalendarEventType;
  "calendars": CalendarType;
  "catalogues": CatalogueType;
  "collections": CollectionType;
  "companies": CompanyType;
  "content-positions": ContentPositionType;
  "custom-attribute-types": CustomAttributeTypeType;
  "custom-attributes": CustomAttributeType;
  "duplicates": DuplicateType;
  "episodes": EpisodeType;
  "genre-scores": GenreScoreType;
  "genres": GenreType;
  "groups": GroupType;
  'images': ImageType;
  "impersonated-users": ImpersonatedUserType;
  "languages": LanguageType;
  "likes": LikeType;
  'limited-access-programme-users': LimitedAccessProgrammeUserType;
  "list-programme-notes": ListProgrammeNoteType;
  "list-programmes": ListProgrammeType;
  "list-series-notes": ListSeriesNoteType;
  "list-series": ListSeryType;
  "list-video-notes": ListVideoNoteType;
  "list-videos": ListVideoType;
  "lists": ListType;
  "marketing-activities": MarketingActivityType;
  "marketing-categories": MarketingCategoryType;
  "meeting-attendees": MeetingAttendeeType;
  "meeting-notes": MeetingNoteType;
  "meetings": MeetingType;
  "meeting-followups": MeetingFollowupType;
  "meta-data": MetaDatumType;
  'news-article-search-results': NewsArticleSearchResultType;
  'news-articles': NewsArticleType;
  'news-categories': NewsCategoryType;
  "page-images": PageImageType;
  "pages": PageType;
  "passports": PassportType;
  "passport-content": PassportContentType;
  "passwords": PasswordType;
  "private-video-accesses": PrivateVideoAccessType;
  "private-video-views": PrivateVideoViewType;
  "production-companies": ProductionCompanyType;
  "programme-alternative-titles": ProgrammeAlternativeTitleType;
  "programme-broadcasters": ProgrammeBroadcasterType;
  "programme-duplicates": ProgrammeDuplicateType;
  "programme-highlight-categories": ProgrammeHighlightCategoryType;
  "programme-highlights": ProgrammeHighlightType;
  "programme-search-results": ProgrammeSearchResultType;
  "programme-talents": ProgrammeTalentType;
  "programme-types": ProgrammeTypeType;
  "programme-views": ProgrammeViewType;
  "production-companies-programmes": ProductionCompaniesProgrammesType;
  "production-companies-series": ProductionCompaniesSeriesType
  "programmes": ProgrammeType;
  "qualities": QualityType;
  "regions": RegionType;
  "reports": ReportType;
  "responsive-images": ResponsiveImageType;
  "restricted-asset-material-companies": RestrictedAssetMaterialCompanyType;
  "restricted-asset-material-groups": RestrictedAssetMaterialGroupType;
  "restricted-asset-material-users": RestrictedAssetMaterialUserType;
  "restricted-programme-companies": RestrictedProgrammeCompanyType;
  "restricted-programme-groups": RestrictedProgrammeGroupType;
  "restricted-programme-users": RestrictedProgrammeUserType;
  "restricted-series-companies": RestrictedSeriesCompanyType;
  "restricted-series-groups": RestrictedSeriesGroupType;
  "restricted-series-users": RestrictedSeriesUserType;
  "restricted-video-companies": RestrictedVideoCompanyType;
  "restricted-video-groups": RestrictedVideoGroupType;
  "restricted-video-users": RestrictedVideoUserType;
  "roles": RoleType;
  "searches": SearchType;
  "series-broadcasters": SeriesBroadcasterType;
  "series-search-results": SeriesSearchResultType;
  "series": SeriesType;
  "seriesTalents": SeriesTalentType,
  "talents": TalentType;
  "team-departments": TeamDepartmentType;
  "team-members": TeamMemberType;
  "team-regions": TeamRegionType;
  "teams": TeamType;
  "territories": TerritoryType;
  "tweets": TweetType;
  "user-programmes": UserProgrammeType;
  "users": UserType;
  "user-search-results": UserSearchResultType;
  "video-download-links": VideoDownloadLinkType;
  "video-search-result": VideoSearchResultType;
  "video-views": VideoViewType;
  "videos": VideoType;
  "video-types": VideoTypesType;
  'virtual-meetings': VirtualMeetingType;
  'virtual-meeting-attendees': VirtualMeetingAttendeeType;
  'virtual-meeting-chat-messages': VirtualMeetingChatMessageType;
  "wistia-accounts": WistiaAccountType;
  "knox-accounts": KnoxAccountType;
}

export interface SingularModels {
  "account-manager": AccountManagerType;
  "anonymous-access": AnonymousAccessType;
  "anonymous-access-item": AnonymousAccessItemsType;
  "approval": ApprovalType;
  "asset-access-report": AssetAccessReportType;
  "asset-category": AssetCategoryType;
  "asset-item": AssetItemType;
  "asset-material": AssetMaterialType;
  "asset-material-search-result": AssetMaterialSearchResultType;
  "auth": AuthType;
  "brightcove-account": BrightcoveAccountType;
  "broadcaster": BroadcasterType
  "calendar-event-location-restriction": CalendarEventLocationRestrictionType;
  "calendar-event-location": CalendarEventLocationType;
  "calendar-event-meal-slot": CalendarEventMealSlotType;
  "calendar-event-opening-time": CalendarEventOpeningTimeType;
  "calendar-event": CalendarEventType;
  "calendar": CalendarType;
  "catalogue": CatalogueType;
  "collection": CollectionType;
  "company": CompanyType;
  "content-position": ContentPositionType;
  "custom-attribute-type": CustomAttributeTypeType;
  "custom-attribute": CustomAttributeType;
  "duplicate": DuplicateType;
  "episode": EpisodeType;
  "genre-score": GenreScoreType;
  "genre": GenreType;
  'image': ImageType;
  "impersonated-user": ImpersonatedUserType;
  "language": LanguageType;
  "like": LikeType;
  'limited-access-programme-user': LimitedAccessProgrammeUserType;
  "list-programme-note": ListProgrammeNoteType;
  "list-programme": ListProgrammeType;
  "list-series-note": ListSeriesNoteType;
  "list-sery": ListSeryType;
  "list-video-note": ListVideoNoteType;
  "list-video": ListVideoType;
  "list": ListType;
  "marketing-activity": MarketingActivityType;
  "marketing-category": MarketingCategoryType;
  "meeting-attendee": MeetingAttendeeType;
  "meeting-note": MeetingNoteType;
  "meeting": MeetingType;
  "meeting-followup": MeetingFollowupType;
  "meta-datum": MetaDatumType;
  'news-article-search-result': NewsArticleSearchResultType;
  'news-article': NewsArticleType;
  'news-category': NewsCategoryType;
  "page-image": PageImageType;
  "page": PageType;
  "passport": PassportType;
  "passport-content": PassportContentType;
  "password": PasswordType;
  "private-video-access": PrivateVideoAccessType;
  "private-video-view": PrivateVideoViewType;
  "production-company": ProductionCompanyType;
  "programme-alternative-title": ProgrammeAlternativeTitleType;
  "programme-broadcaster": ProgrammeBroadcasterType;
  "programme-duplicate": ProgrammeDuplicateType;
  "programme-highlight-category": ProgrammeHighlightCategoryType;
  "programme-highlight": ProgrammeHighlightType;
  "programme-highlight-page": ProgrammeHighlightPageType;
  "programme-search-result": ProgrammeSearchResultType;
  "programme-talent": ProgrammeTalentType;
  "programme-type": ProgrammeTypeType;
  "programme-view": ProgrammeViewType;
  "programme": ProgrammeType;
  "quality": QualityType;
  "region": RegionType;
  "report": ReportType;
  "responsive-image": ResponsiveImageType;
  "production-companies-programme": ProductionCompaniesProgrammesType;
  "production-companies-series": ProductionCompaniesSeriesType
  "restricted-asset-material-company": RestrictedAssetMaterialCompanyType;
  "restricted-asset-material-group": RestrictedAssetMaterialGroupType;
  "restricted-asset-material-user": RestrictedAssetMaterialUserType;
  "restricted-programme-company": RestrictedProgrammeCompanyType;
  "restricted-programme-group": RestrictedProgrammeGroupType;
  "restricted-programme-user": RestrictedProgrammeUserType;
  "restricted-series-company": RestrictedSeriesCompanyType;
  "restricted-series-group": RestrictedSeriesGroupType;
  "restricted-series-user": RestrictedSeriesUserType;
  "restricted-video-company": RestrictedVideoCompanyType;
  "restricted-video-group": RestrictedVideoGroupType;
  "restricted-video-user": RestrictedVideoUserType;
  "role": RoleType;
  "search": SearchType;
  "series-broadcaster": SeriesBroadcasterType;
  "series-search-result": SeriesSearchResultType;
  "series-talent": SeriesTalentType;
  "series": SeriesType;
  "talent": TalentType;
  "talent-type": TalentTypeType;
  "team-department": TeamDepartmentType;
  "team-member": TeamMemberType;
  "team-region": TeamRegionType;
  "team": TeamType;
  "territory": TerritoryType;
  "tweet": TweetType;
  "user-programme": UserProgrammeType;
  "user": UserType;
  "user-search-result": UserSearchResultType;
  "video-download-link": VideoDownloadLinkType;
  "video-search-result": VideoSearchResultType;
  "video-view": VideoViewType;
  "video": VideoType;
  "video-type": VideoTypesType;
  'virtual-meeting': VirtualMeetingType;
  'virtual-meeting-attendee': VirtualMeetingAttendeeType;
  'virtual-meeting-chat-message': VirtualMeetingChatMessageType;
  "wistia-account": WistiaAccountType;
  "knox-account": KnoxAccountType;
}

export interface PermittedIncludes {
  "account-managers":
    | 'users'
  "approvals":
    | 'users'
    | 'users'
  "asset-access-reports":
    | 'asset-categories'
    | 'asset-items'
    | 'users'
    | 'users'
    | 'languages'
    | 'companies'
  "asset-categories": never
  "asset-items": never
  "asset-materials":
    | 'asset-categories'
    | 'asset-items'
    | 'users'
    | 'companies'
    | 'languages'
  "auths":
    | 'roles'
    | 'users'
    | 'companies'
    | 'territories'
    | 'genres'
  "calendar-event-location-restrictions":
    | 'calendar-event-locations'
    | 'users'
  "calendar-event-locations":
    | 'calendar-events'
    | 'calendar-event-location-restrictions'
  "calendar-event-meal-slots":
    | 'calendar-events'
  "calendar-event-opening-times":
    | 'calendar-events'
  "calendar-events":
    | 'calendar-event-locations'
    | 'calendar-event-meal-slots'
    | 'calendar-event-opening-times'
    | 'calendars'
    | 'users'
  "calendars":
    | 'meetings'
    | 'calendar-event-opening-times'
  "collections":
    | 'pages'
    | 'content-positions'
    | 'meta-data'
  "companies":
    | 'users'
  "content-positions": never
  "custom-attribute-types":
    | 'custom-attributes'
  "custom-attributes":
    | 'custom-attribute-types'
  "customers": never
  "duplicates": never
  "episodes":
    | 'series'
    | 'videos'
  "genre-scores":
    | 'genres'
  "genres":
    | 'genres'
    | 'genres'
    | 'genres'
    | 'programmes'
  "languages":
    | 'asset-materials'
  "likes": never
  "list-programme-notes":
    | 'list-programmes'
  "list-programmes":
    | 'likes'
    | 'programmes'
    | 'lists'
    | 'list-programme-notes'
    | 'users'
  "list-series-notes":
    | 'list-series'
  "list-series":
    | 'series'
    | 'series-notes'
    | 'lists'
    | 'likes'
  "list-video-notes":
    | 'list-videos'
  "list-videos":
    | 'videos'
    | 'video-notes'
    | 'lists'
    | 'likes'
  "lists":
    | 'list-programmes'
    | 'list-videos'
    | 'list-series'
    | 'users'
    | 'meetings'
    | 'users'
  "marketing-activities":
    | 'marketing-categories'
    | 'programmes'
  "marketing-categories": never
  "meeting-attendees":
    | 'users'
  "meeting-notes":
    | 'meetings'
    | 'users'
  "meetings":
    | 'customers'
    | 'users'
    | 'users'
    | 'lists'
    | 'meeting-notes'
    | 'meeting-attendees'
    | 'calendar-events'
    | 'calendar-event-locations'
    | 'calendar-event-meal-slots'
    | 'meeting-followups'
  "meta-data":
    | 'programmes'
    | 'pages'
    | 'collections'
  "page-images": never
  "pages":
    | 'page-images'
    | 'collections'
    | 'content-positions'
    | 'meta-data'
  "passports": never
  "passwords": never
  "private-video-accesses": never
  "private-video-views":
    | 'videos'
  "production-companies":
    | 'videos'
  "programme-alternative-titles":
    | 'programmes'
  "programme-duplicates": never
  "programme-highlight-categories":
    | 'programme-highlights'
    | 'genres'
  "programme-highlights":
    | 'programmes'
    | 'users'
    | 'programme-highlight-categories'
  "programme-highlight-pages":
    | 'programme-highlights'
    | 'programme-highlight-categories'
      'programme-highlights-pages'
  "programme-search-results":
    | 'programmes'
  "programme-talents":
    | 'talents'
    | 'programmes'
  "programme-views":
    | 'programmes'
  "production-companies-programmes":
    | 'programme'
    | 'production-company'
  "programmes":
    | 'custom-attributes'
    | 'genres'
    | 'qualities'
    | 'production-companies'
    | 'series'
    | 'series'
    | 'episodes'
    | 'languages'
    | 'users'
    | 'companies'
    | 'page-images'
    | 'videos'
    | 'programme-alternative-titles'
    | 'programmes'
    | "production-companies-programmes"
    | 'meta-data'
  "qualities": never
  "reports": never
  "restricted-asset-material-companies":
    | 'asset-materials'
    | 'companies'
  "restricted-asset-material-users":
    | 'asset-materials'
    | 'users'
  "restricted-programme-companies":
    | 'programmes'
    | 'companies'
  "restricted-programme-users":
    | 'programmes'
    | 'users'
  "restricted-series-companies":
    | 'series'
    | 'companies'
  "restricted-series-users":
    | 'series'
    | 'users'
  "restricted-video-companies":
    | 'videos'
    | 'companies'
  "restricted-video-users":
    | 'videos'
    | 'users'
  "roles":
    | 'users'
  "searches": never
  "series-search-results": never
  "series":
    | 'custom-attributes'
    | 'users'
    | 'companies'
    | 'episodes'
    | 'videos'
    | 'programmes'
  "talents": never
  "team-departments": never
  "team-members":
    | 'team-regions'
    | 'team-departments'
    | 'teams'
  "team-regions": never
  "teams": never
  "territories":
    | 'users'
  "tweets":
    | 'users'
  "user-programmes":
    | 'programmes'
  "user-search-results": 'users'
  "users":
    | 'lists'
    | 'users'
    | 'companies'
    | 'roles'
    | 'genres'
    | 'programmes'
    | 'territories'
  "video-download-links":
    | 'videos'
  "video-search-results":
    | 'videos'
  "video-views":
    | 'videos'
  "videos":
    | 'users'
    | 'companies'
    | 'private-video-accesses'
    | 'video-type'
}
