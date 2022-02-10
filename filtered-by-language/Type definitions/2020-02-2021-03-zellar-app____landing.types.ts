import { IAxiosError, IDisabledLoadingElements, IRouteHistory, IIsModalVisible } from "../../pages.types";

// Interfaces

export interface ILanding extends IRouteHistory {}

export interface IUseState extends IAxiosError, IIsModalVisible {
  /** The disabled and/or loading states of buttons */
  disabledLoadingElements: IDisabledLoadingElements;
  /** Is the <form> dirty or not? */
  isFormDirty: boolean;
  /** Whether a modal (compact) is visible or not */
  isModalCompactVisible: boolean;
  /** Whether or not the Modal is processing an API call or not */
  isModalLocked: boolean;
  /** What content to show within the modal (header, content and footer segments) */
  modalMode: "edit-profile" | "image-upload-logo";
}

export interface IUseStateSectors {
  /** The value of the currently selected sector */
  activeSectorId: number;
  /* The text of the currently selected sector */
  activeSectorText: string;
  apiSectors: {
    data: {
      /** The display text of the sector */
      text: string;
      /** The dropdown value for the sector */
      value: number;
    }[];
    /** Whether the sectors dropdown is loading external data or not */
    isLoading: boolean;
  };
  apiSubSectors: {
    data: {
      /** The display text of the sector */
      text: string;
      /** The dropdown value for the sector */
      value: number;
    }[];
    /** Whether the sub-sectors dropdown is loading external data or not */
    isLoading: boolean;
  };
}

// Types

export type TFetchSectors = (
  /** The sector id to fetch the sub-sectors for */
  sectorId: number
) => void;

export type TFetchSubSectors = (
  /** The sector id to fetch the sub-sectors for */
  sectorId: number
) => void;

export type TOnAPISectorSelect = (
  /** The sector id selected */
  sectorId: number
) => void;

export type TPrePopulateForm = (
  fieldData: {
    /** A unique form field with its value provided for pre-population */
    [key: string]: any;
  }[]
) => void;

export type TSubmitImageUploadToAPI = (
  /** The base64Encode data for the image being uploaded */
  imageUploadLogoUnsaved: string
) => void;

export type TSubmitToAPI = (formData: {
  /** The business description */
  about: string;
  /** Which sector the company belongs to */
  sector: number;
  /** Which sub-sector the company belongs to */
  subSector: number;
  /** The companies telephone number */
  telephone: string;
  /** The companies website address */
  website: string;
}) => void;

export type TSwitchModalMode = (
  /** The mode of the modal which determines which content it should contain */
  mode: "edit-profile" | "image-upload-logo"
) => void;

export type TToggleMode = (
  /** Whether or not the modal is visible or not */
  visible: boolean
) => void;

export type TToggleModalCompact = (
  /** Whether or not the compact modal is visible or not */
  visible: boolean,
  /** Whether the parent modal should also be closed or not */
  fullReset?: boolean
) => void;

export type TUpdateFormDirty = (
  /** Whether the form is dirty or not */
  isDirty: boolean
) => void;
