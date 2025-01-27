import { mount } from 'enzyme'
import { Link } from 'react-router-dom'
import i18n from '../../../../i18n/testConfig'
import { AccountTransactionTable } from '../index'
import TEST_TRANSACTIONS_DATA from './mockTransactions.json'
import { getAccountTransactions } from '../../../../rippled'
import { flushPromises, QuickHarness } from '../../../test/utils'
import Mock = jest.Mock

jest.mock('../../../../rippled', () => ({
  __esModule: true,
  getAccountTransactions: jest.fn(),
}))

const TEST_ACCOUNT_ID = 'rTEST_ACCOUNT'

describe('AccountTransactionsTable container', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  const createWrapper = (
    getAccountTransactionsImpl: () => Promise<any> = () =>
      new Promise(() => {}),
    currencySelected: string = '',
    state = { hasToken: false },
  ) => {
    ;(getAccountTransactions as Mock).mockImplementation(
      getAccountTransactionsImpl,
    )
    return mount(
      <QuickHarness i18n={i18n}>
        <AccountTransactionTable
          accountId={TEST_ACCOUNT_ID}
          hasTokensColumn={state.hasToken}
          currencySelected={currencySelected}
        />
      </QuickHarness>,
    )
  }

  it('renders static parts', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.transaction-table').length).toBe(1)
    wrapper.unmount()
  })

  it('renders loader when fetching data', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.loader').length).toBe(1)
    wrapper.unmount()
  })

  it('renders dynamic content with transaction data', async () => {
    const component = createWrapper(() =>
      Promise.resolve(TEST_TRANSACTIONS_DATA),
    )

    await flushPromises()
    component.update()

    expect(component.find('.col-token').length).toBe(0)
    expect(component.find('.load-more-btn').length).toBe(1)
    expect(component.find('.transaction-table').length).toBe(1)
    expect(component.find('.transaction-li.transaction-li-header').length).toBe(
      1,
    )
    expect(component.find(Link).length).toBe(40)

    component.find('.load-more-btn').simulate('click')
    expect(getAccountTransactions).toHaveBeenCalledWith(
      TEST_ACCOUNT_ID,
      undefined,
      '44922483.5',
      undefined,
      undefined,
    )

    component.unmount()
  })

  it('renders error message when request fails', async () => {
    const component = createWrapper(() => Promise.reject())

    await flushPromises()
    component.update()

    expect(component.find('.load-more-btn')).not.toExist()
    expect(component.find('.transaction-table')).toExist()
    expect(component.find('.empty-transactions-message')).toHaveText(
      'get_account_transactions_failed',
    )
    expect(component.find(Link).length).toBe(0)
    component.unmount()
  })

  it('renders try loading more message when no filtered results show but there is a marker', async () => {
    const component = createWrapper(
      () => Promise.resolve(TEST_TRANSACTIONS_DATA),
      'EUR',
    )

    await flushPromises()
    component.update()

    expect(component.find('.load-more-btn')).toExist()
    expect(component.find('.transaction-table')).toExist()
    expect(component.find('.empty-transactions-message')).toHaveText(
      'get_account_transactions_try',
    )
    expect(component.find(Link).length).toBe(0)
    component.unmount()
  })

  it('renders dynamic content with transaction data and token column', async () => {
    const component = createWrapper(
      () => Promise.resolve(TEST_TRANSACTIONS_DATA),
      undefined,
      { hasToken: true },
    )

    await flushPromises()
    component.update()

    expect(component.find('.col-token').length).toBeGreaterThan(0)
    expect(component.find('.load-more-btn').length).toBe(1)
    expect(component.find('.transaction-table').length).toBe(1)
    expect(component.find('.transaction-li.transaction-li-header').length).toBe(
      1,
    )
    expect(component.find(Link).length).toBe(40)

    component.find('.load-more-btn').simulate('click')
    expect(getAccountTransactions).toHaveBeenCalledWith(
      TEST_ACCOUNT_ID,
      undefined,
      '44922483.5',
      undefined,
      undefined,
    )

    component.unmount()
  })

  it('renders error message when request fails', async () => {
    const component = createWrapper(() => Promise.reject())

    await flushPromises()
    component.update()

    expect(component.find('.load-more-btn')).not.toExist()
    expect(component.find('.transaction-table')).toExist()
    expect(component.find('.empty-transactions-message')).toHaveText(
      'get_account_transactions_failed',
    )
    expect(component.find(Link).length).toBe(0)
    component.unmount()
  })

  it('renders try loading more message when no filtered results show but there is a marker', async () => {
    const component = createWrapper(
      () => Promise.resolve(TEST_TRANSACTIONS_DATA),
      'EUR',
    )

    await flushPromises()
    component.update()

    expect(component.find('.load-more-btn')).toExist()
    expect(component.find('.transaction-table')).toExist()
    expect(component.find('.empty-transactions-message')).toHaveText(
      'get_account_transactions_try',
    )
    expect(component.find(Link).length).toBe(0)
    component.unmount()
  })
})
