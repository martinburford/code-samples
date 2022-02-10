import { useState } from 'react';

// Components
import AddGiftWrapping from 'components/ui/molecules/add-gift-wrapping';
import Button from 'components/ui/atoms/button';
import Callout from 'components/ui/atoms/callout';
import CalloutJustified from 'components/ui/molecules/callout-justified';
import Checkbox from 'components/ui/atoms/checkbox';
import CheckboxList from 'components/ui/molecules/checkbox-list';
import ChevronLink from 'components/ui/atoms/chevron-link';
import ComponentIndent from 'components/ui/atoms/component-indent';
import ContentCentered from 'components/ui/molecules/content-centered';
import ContentJustified from 'components/ui/molecules/content-justified';
import ContextWrapper from 'components/ui/demo/context-wrapper';
import Divider from 'components/ui/atoms/divider';
import FilterBar from 'components/ui/molecules/filter-bar';
import FilterChips from 'components/ui/molecules/filter-chips';
import HeaderBar from 'components/ui/molecules/header-bar';
import HorizontalScroller from 'components/ui/widgets/horizontal-scroller';
import Icon from 'components/ui/atoms/icon';
import IconList from 'components/ui/atoms/icon-list';
import ItemListingsHorizontal from 'components/ui/widgets/item-listings-horizontal';
import ItemListingsVertical from 'components/ui/widgets/item-listings-vertical';
import Layout from 'components/ui/demo/layout';
import Modal from 'components/ui/atoms/modal';
import Page from 'components/ui/atoms/page';
import PriceSummary from 'components/ui/atoms/price-summary';
import ProductListingHorizontal from 'components/ui/widgets/product-listing-horizontal';
import ProductListingVertical from 'components/ui/widgets/product-listing-vertical';
import ProductQuantity from 'components/ui/molecules/product-quantity';
import PromoCode from 'components/ui/molecules/promo-code';
import RadioList from 'components/ui/atoms/radio-list';
import SelectionList from 'components/ui/atoms/selection-list';
import SizeChart from 'components/ui/atoms/size-chart';
import Slider from 'components/ui/atoms/slider';
import TabsBar from 'components/ui/molecules/tabs-bar';
import Textarea from 'components/ui/atoms/textarea';
import Textfield from 'components/ui/atoms/textfield';
import TrendingListingVertical from 'components/ui/molecules/trending-listing-vertical';
import Typography from 'components/ui/global/typography';

const DemoProductListingPage = () => {
  const [state, updateState] = useState({
    modal: false,
  });

  // De-struturing
  const { modal } = state;

  return (
    <Layout type="page">
      <Page id="plp">
        <Modal
          footer={<p>Footer content</p>}
          header="Heading"
          onClose={() => {
            updateState({
              ...state,
              modal: !modal,
            });
          }}
          parent="div[data-id='demo-page-content']"
          position="right"
          visible={modal}
        >
          {/* SelectionList */}
          <SelectionList
            items={[
              {
                selected: false,
                text: 'Item 1',
              },
              {
                selected: true,
                text: 'Item 2',
              },
              {
                selected: false,
                text: 'Item 3',
              },
              {
                selected: false,
                text: 'Item 4',
              },
            ]}
            itemsPerRow={2}
            title={<ChevronLink text="Chevron Link" title="Heading" url="/#url1" />}
          />
          {/* SelectionList */}
          <SelectionList
            items={[
              {
                selected: false,
                text: 'Item 1',
              },
              {
                selected: true,
                text: 'Item 2',
              },
              {
                selected: false,
                text: 'Item 3',
              },
              {
                selected: false,
                text: 'Item 4',
              },
            ]}
            itemsPerRow={2}
            title={<ChevronLink text="Chevron Link" title="Heading" url="/#url1" />}
          />
          {/* SelectionList */}
          <SelectionList
            items={[
              {
                selected: false,
                text: 'Item 1',
              },
              {
                selected: true,
                text: 'Item 2',
              },
              {
                selected: false,
                text: 'Item 3',
              },
              {
                selected: false,
                text: 'Item 4',
              },
            ]}
            itemsPerRow={2}
            title={<ChevronLink text="Chevron Link" title="Heading" url="/#url1" />}
          />
          {/* Slider */}
          <Slider
            initial={{
              min: 75,
              max: 400,
            }}
            scale={{
              min: 0,
              max: 650,
            }}
            theme="purple"
            title="Sample title"
          />
          <Button
            onClick={() =>
              updateState({
                ...state,
                modal: !modal,
              })
            }
            variant="large"
          >
            Button text
          </Button>
        </Modal>

        {/* HeaderBar */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <HeaderBar
            dataAttributes={{ 'data-component-spacing': 'xxl' }}
            slot1={<Icon colour="purple" id="arrowLeft" />}
            slot2={<Icon colour="purple" id="searchRound" />}
            title="Title"
          />
        </ComponentIndent>

        {/* FilterBar */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <FilterBar
            label="xx products"
            onClick={() =>
              updateState({
                ...state,
                modal: !modal,
              })
            }
            relatedElementId="product-listings"
          />
        </ComponentIndent>

        {/* FilterChips */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <FilterChips
            allowRemoval={true}
            items={[
              {
                id: 1,
                label: 'Label 1',
              },
              {
                id: 2,
                label: 'Label 2',
              },
              {
                id: 3,
                label: 'Label 3',
              },
              {
                id: 4,
                label: 'Label 4',
              },
              {
                id: 5,
                label: 'Label 5',
              },
            ]}
          />
        </ComponentIndent>

        {/* ItemListingsVertical */}
        <div data-component-spacing="m">
          <ComponentIndent
            dataAttributes={{ 'data-component-spacing': '0' }}
            responsive={{
              mobile: false,
              tablet: false,
              desktop: true,
            }}
          >
            <ItemListingsVertical
              dataAttributes={{
                'data-id': 'product-listings',
              }}
              items={[
                <ProductListingVertical
                  brand="DKNY"
                  canBeAddedToBag={false}
                  currency="GBP"
                  discountedPrice="35.000"
                  key={1}
                  placeholder={{
                    background: 'gray',
                    ratio: '4x3',
                    showRatio: false,
                  }}
                  price="49.000"
                  productId={1}
                  productTitle="Product title"
                  starsRating={{
                    colour: 'gray',
                    mode: 'clickthrough',
                    productId: 1,
                    score: 2.5,
                    size: 'small',
                    url: '#url1',
                    votes: 35,
                  }}
                  status="exclusive"
                />,
                <ProductListingVertical
                  brand="DKNY"
                  canBeAddedToBag={false}
                  currency="GBP"
                  discountedPrice="35.000"
                  key={2}
                  placeholder={{
                    background: 'gray',
                    ratio: '4x3',
                    showRatio: false,
                  }}
                  price="49.000"
                  productId={2}
                  productTitle="Product title"
                  starsRating={{
                    colour: 'gray',
                    mode: 'clickthrough',
                    productId: 2,
                    score: 2.5,
                    size: 'small',
                    url: '#url2',
                    votes: 35,
                  }}
                  status="limited"
                />,
                <ProductListingVertical
                  brand="DKNY"
                  canBeAddedToBag={false}
                  currency="GBP"
                  discountedPrice="35.000"
                  key={3}
                  placeholder={{
                    background: 'gray',
                    ratio: '4x3',
                    showRatio: false,
                  }}
                  price="49.000"
                  productId={3}
                  productTitle="Product title"
                  starsRating={{
                    colour: 'gray',
                    mode: 'clickthrough',
                    productId: 3,
                    score: 2.5,
                    size: 'small',
                    url: '#url3',
                    votes: 35,
                  }}
                  status="new"
                />,
                <ProductListingVertical
                  brand="DKNY"
                  canBeAddedToBag={false}
                  currency="GBP"
                  discountedPrice="35.000"
                  key={4}
                  placeholder={{
                    background: 'gray',
                    ratio: '4x3',
                    showRatio: false,
                  }}
                  price="49.000"
                  productId={4}
                  productTitle="Product title"
                  starsRating={{
                    colour: 'gray',
                    mode: 'clickthrough',
                    productId: 4,
                    score: 2.5,
                    size: 'small',
                    url: '#url4',
                    votes: 35,
                  }}
                  status="sale"
                />,
                <ProductListingVertical
                  brand="DKNY"
                  canBeAddedToBag={false}
                  currency="GBP"
                  discountedPrice="35.000"
                  key={5}
                  placeholder={{
                    background: 'gray',
                    ratio: '4x3',
                    showRatio: false,
                  }}
                  price="49.000"
                  productId={5}
                  productTitle="Product title"
                  starsRating={{
                    colour: 'gray',
                    mode: 'clickthrough',
                    productId: 5,
                    score: 2.5,
                    size: 'small',
                    url: '#url5',
                    votes: 35,
                  }}
                  status="exclusive"
                />,
                <ProductListingVertical
                  brand="DKNY"
                  canBeAddedToBag={false}
                  currency="GBP"
                  discountedPrice="35.000"
                  key={6}
                  placeholder={{
                    background: 'gray',
                    ratio: '4x3',
                    showRatio: false,
                  }}
                  price="49.000"
                  productId={6}
                  productTitle="Product title"
                  starsRating={{
                    colour: 'gray',
                    mode: 'clickthrough',
                    productId: 6,
                    score: 2.5,
                    size: 'small',
                    url: '#url6',
                    votes: 35,
                  }}
                  status="limited"
                />,
              ]}
              itemsPerRow={{
                mobile: 2,
                tablet: 3,
                desktop: 6,
              }}
            />
          </ComponentIndent>
        </div>

        {/* Callout */}
        <Callout text="Callout text" theme="purple" />

        {/* CalloutJustified */}
        <CalloutJustified
          slot1={
            <IconList
              items={[
                {
                  icon: <Icon colour="success" id="tick" />,
                  text: 'Callout Justified text',
                },
              ]}
            />
          }
          slot2={
            <Typography.Text colour="gray" uppercase={true} variant="body-2">
              Callout Justified text
            </Typography.Text>
          }
          theme="teal"
        />

        {/* ContentCentered */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <ContentCentered>
            Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text
            Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text
            Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text
            Sample text Sample text Sample text Sample text Sample text Sample text
            <br />
            <br />
            <strong>Sample text Sample text Sample text</strong>
            <br />
            <em>Sample text Sample text Sample text</em>
            <br />
            <br />
            Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text Sample text
          </ContentCentered>
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* ContentJustified */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <ContentJustified
            slot1={
              <p>
                Content Justified ... Slot 1 text Slot 1 text Slot 1 text Slot 1 text Slot 1 text Slot 1 text Slot 1
                text Slot 1 text
              </p>
            }
            slot2={
              <p>
                Content Justified ... Slot 2 text Slot 2 text Slot 2 text Slot 2 text Slot 2 text Slot 2 text Slot 2
                text Slot 2 text
              </p>
            }
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* SelectionList */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <SelectionList
            items={[
              {
                selected: false,
                text: 'Item 1',
              },
              {
                selected: true,
                text: 'Item 2',
              },
              {
                selected: false,
                text: 'Item 3',
              },
              {
                selected: false,
                text: 'Item 4',
              },
              {
                selected: true,
                text: 'Item 5',
              },
              {
                selected: false,
                text: 'Item 6',
              },
            ]}
            title={
              <ChevronLink
                dataAttributes={{ 'data-component-spacing': 'xs' }}
                text="Chevron Link"
                title="Multiple selection"
                url="/#url1"
              />
            }
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* SelectionList (2x wide) */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <SelectionList
            items={[
              {
                selected: false,
                text: 'Item 1',
              },
              {
                selected: true,
                text: 'Item 2',
              },
              {
                selected: false,
                text: 'Item 3',
              },
              {
                selected: false,
                text: 'Item 4',
              },
              {
                selected: true,
                text: 'Item 5',
              },
              {
                selected: false,
                text: 'Item 6',
              },
            ]}
            itemsPerRow={2}
            title={
              <ChevronLink
                dataAttributes={{ 'data-component-spacing': 'xs' }}
                text="Chevron Link"
                title="Multiple selection (split)"
                url="/#url1"
              />
            }
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* SelectionList (single selection) */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <SelectionList
            items={[
              {
                selected: false,
                text: 'Item 1',
              },
              {
                selected: true,
                text: 'Item 2',
              },
              {
                selected: false,
                text: 'Item 3',
              },
              {
                selected: false,
                text: 'Item 4',
              },
              {
                selected: false,
                text: 'Item 5',
              },
              {
                selected: false,
                text: 'Item 6',
              },
            ]}
            singleSelection={true}
            title={
              <ChevronLink
                dataAttributes={{ 'data-component-spacing': 'xs' }}
                text="Chevron Link"
                title="Single selection"
                url="/#url1"
              />
            }
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Slider */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <ContextWrapper>
            <Slider
              initial={{
                min: 75,
                max: 400,
              }}
              scale={{
                min: 0,
                max: 650,
              }}
              theme="purple"
              title="Sample title"
            />
          </ContextWrapper>
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* PriceSummary (with suffix text) */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <PromoCode />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* PriceSummary (with suffix text) */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <PriceSummary
            currency="KWD"
            discount="21.000"
            subTotal="321.000"
            suffixText="Sample suffix text"
            total="300.000"
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* ProductQuantity */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <ProductQuantity quantity={0} />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* HorizontalScroller */}
        <ComponentIndent
          dataAttributes={{ 'data-component-spacing': '0' }}
          responsive={{
            mobile: false,
            tablet: false,
            desktop: true,
          }}
        >
          <HorizontalScroller
            heading="Sample title"
            items={[
              <TrendingListingVertical
                id={1}
                key={1}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={2}
                key={2}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={3}
                key={3}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={4}
                key={4}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={5}
                key={5}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={6}
                key={6}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={7}
                key={7}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={8}
                key={8}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={9}
                key={9}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
              <TrendingListingVertical
                id={10}
                key={10}
                label="DKNY"
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                showFollow={true}
              />,
            ]}
            itemsPerRow={{
              mobile: 2,
              tablet: 3,
              desktop: 6,
            }}
            scrollable={true}
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* SizeChart */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <SizeChart countries={['eu', 'us', 'aus', 'mex']} />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Textfield */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <Textfield
            background="tan"
            label="Sample label"
            name="textfield-white"
            placeholder="Placeholder text"
            required={true}
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Textarea */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <Textarea
            background="tan"
            label="Sample label"
            name="textarea-white"
            placeholder="Placeholder text"
            required={true}
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* RadioList (block) */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <RadioList
            id="radio-list-block"
            items={[
              {
                selected: true,
                text: 'Sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long',
                value: 1,
              },
              {
                selected: false,
                text: 'Sample label text 2',
                value: 2,
              },
              {
                selected: false,
                text: 'Sample label text 3',
                value: 3,
              },
            ]}
            title="Sample title"
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* RadioList (block) */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <RadioList
            id="radio-list-inline"
            inline={true}
            items={[
              {
                selected: true,
                text: 'Sample label text 1',
                value: 1,
              },
              {
                selected: false,
                text: 'Sample label text 2',
                value: 2,
              },
            ]}
            title="Sample title"
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Checkbox */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <Checkbox checked={true} label="Short label" name="sample-name-checked-by-default" value="Sample value" />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Checkbox */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <Checkbox
            checked={true}
            label="Short label"
            name="sample-name-checked-by-default-reverse"
            reverse={true}
            value="Sample value"
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Checkbox */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <CheckboxList
            items={[
              {
                checked: true,
                label:
                  'Sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long sample label text long',
                name: 'block-name-1',
                value: 'block-value-1',
              },
              {
                checked: false,
                label: 'Sample label text',
                name: 'block-name-2',
                value: 'block-value-2',
              },
              {
                checked: false,
                label: 'Sample label text',
                name: 'block-name-3',
                value: 'block-value-3',
              },
            ]}
            title="Sample title"
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Checkbox */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <CheckboxList
            inline={true}
            items={[
              {
                checked: true,
                label: 'Sample label text',
                name: 'inline-name-1',
                value: 'inline-value-1',
              },
              {
                checked: false,
                label: 'Sample label text',
                name: 'inline-name-2',
                value: 'inline-value-2',
              },
            ]}
            title="Sample title"
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Add Gift Wrapping */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <AddGiftWrapping
            charge={{
              amount: '12.50',
              currency: 'GBP',
            }}
            id={1}
          />
        </ComponentIndent>

        {/* Divider */}
        <Divider />

        {/* Add Gift Wrapping */}
        <ComponentIndent dataAttributes={{ 'data-component-spacing': '0' }} all={true}>
          <ItemListingsHorizontal
            items={[
              <ProductListingHorizontal
                id={1}
                key={1}
                onRemove={id => alert(`<ProductListingHorizontal>: onRemove: id=${id}`)}
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                productQuantity={{
                  quantity: -1,
                }}
                productSummary={{
                  brand: 'DKNY',
                  currency: 'KWD',
                  discountedPrice: '35.000',
                  price: '49.000',
                  title: 'Product title',
                }}
              />,
              <ProductListingHorizontal
                id={2}
                key={2}
                onRemove={id => alert(`<ProductListingHorizontal>: onRemove: id=${id}`)}
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                productQuantity={{
                  quantity: 1,
                }}
                productSummary={{
                  brand: 'DKNY',
                  currency: 'KWD',
                  price: '49.000',
                  title: 'Product title',
                }}
              />,
              <ProductListingHorizontal
                addGiftWrapping={{
                  charge: {
                    amount: '12.50',
                    currency: 'GBP',
                  },
                  id: 3,
                }}
                key={3}
                id={3}
                onRemove={id => alert('<ProductListingHorizontal>: onRemove: id=' + id)}
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                productQuantity={{
                  quantity: 0,
                }}
                productSummary={{
                  brand: 'DKNY',
                  currency: 'KWD',
                  discountedPrice: '35.000',
                  price: '49.000',
                  title: 'Product title',
                }}
              />,
              <ProductListingHorizontal
                addGiftWrapping={{
                  charge: {
                    amount: '12.50',
                    currency: 'GBP',
                  },
                  id: 4,
                }}
                key={4}
                dataAttributes={{ 'data-component-spacing': '0' }}
                id={4}
                onRemove={id => alert('<ProductListingHorizontal>: onRemove: id=' + id)}
                placeholder={{
                  background: 'gray',
                  ratio: '1x1',
                }}
                productQuantity={{
                  quantity: 0,
                }}
                productSummary={{
                  brand: 'DKNY',
                  currency: 'KWD',
                  discountedPrice: '35.000',
                  price: '49.000',
                  title:
                    'Product title long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long',
                }}
              />,
            ]}
          />
        </ComponentIndent>

        {/* TabsBar */}
        <TabsBar
          dataAttributes={{ 'data-component-spacing': '0' }}
          locked={false}
          pages={[
            {
              icon: 'starEmpty',
              url: '/demo/pages/homepage',
            },
            {
              icon: 'categories',
              url: '/tab2',
            },
            {
              icon: 'heart',
              url: '/tab3',
            },
            {
              icon: 'bag',
              url: '/tab4',
            },
            {
              icon: 'more',
              url: '/tab5',
            },
          ]}
        />
      </Page>
    </Layout>
  );
};

export default DemoProductListingPage;
