import React, { Component } from 'react'
import { Checkbox, Header, Input, Table } from 'semantic-ui-react'
import trn from './trn.txt'
import './App.css'
const DISPLAY_MAX_INDEX = 20

class App extends Component {
  state = {
    rows   : [],
    filters: [],
  }
  cacheRows     = []
  cacheFilters  = []
  defaultCommon = true
  defaultSearch = ''

  componentDidMount() {
    this.init()
  }

  init = async () => {
    // Fetch translations
    const resp = await fetch(trn)
    const data = await resp.text()
    const rows = data.split('\n').map((r, id) => {
      const [en, zh, common] = r.split('\t')
      return {
        id, en, zh, common,
        searchString: `${en}\t${zh}`.toLowerCase(),
      }
    })
    // Init filters
    const filters = [
      this.createFilterCommon(this.defaultCommon),
      this.createFilterSearch(this.defaultSearch),
    ]
    // Refresh
    this.setState({rows, filters})
  }

  updateFilter = (i, createFilter) => (evt, data) => {
    const value =
      data.type === "checkbox" ? data.checked :
      data.type === "text"     ? data.value   :
      undefined
    const filters = this.state.filters.slice()
    filters[i] = createFilter(value)
    this.setState({filters})
  }

  createFilterCommon = (isTrue) => (rows) => {
    return isTrue === false ? rows :
      rows.filter(r => r.common === '1')
  }

  createFilterSearch = (keyword) => (rows) => {
    const kw = keyword.toLowerCase()
    return rows.filter(r => r.searchString.includes(kw))
  }

  render() {
    const { filters } = this.state
    const { cacheRows, cacheFilters } = this

    let rows = this.state.rows
    let firstMiss = filters.findIndex((f, i) => f !== cacheFilters[i])
    if (firstMiss > 0)
      rows = cacheRows[firstMiss - 1]
    else
      firstMiss = 0
    for (let i = firstMiss; i < filters.length; i++) {
      const filter = filters[i]
      rows = filter(rows)
      cacheRows[i] = rows
      cacheFilters[i] = filter
    }

    const dspRows = rows.slice(0, rows.length < DISPLAY_MAX_INDEX ? rows.length : DISPLAY_MAX_INDEX)
    const hideNum = rows.length - dspRows.length

    return (
      <div id='wrapper'>
        <Table id='main' compact striped selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                <Header as='h1' content={document.title} />
              </Table.HeaderCell>
              <Table.HeaderCell textAlign='right'>
                <Checkbox label={'Common Only'}
                          defaultChecked={this.defaultCommon}
                          onChange={this.updateFilter(0, this.createFilterCommon)} />
                <Input placeholder='Search' icon='search' autoFocus
                       onChange={this.updateFilter(1, this.createFilterSearch)} />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
          {dspRows.map(row => (
            <Table.Row key={row.id}>
              <Table.Cell>{row.en}</Table.Cell>
              <Table.Cell>{row.zh}</Table.Cell>
            </Table.Row>
          ))
          }
          {hideNum > 0 ? (
            <Table.Row disabled key={Number.MAX_SAFE_INTEGER}>
              <Table.Cell colSpan='2'>{hideNum} more...</Table.Cell>
            </Table.Row>
          ) : null}
          </Table.Body>
        </Table>

        <footer>
          <p>&copy; <a href="https://dazzyd.org">Dazzy Ding</a> | <a href="https://github.com/yukixz/eve-trn">Github</a></p>
        </footer>
      </div>
    )
  }
}

export default App
