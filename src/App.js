import React, { Component } from 'react'
import { Checkbox, Header, Input, Table } from 'semantic-ui-react'
import trn from './trn.txt'
import './App.css'
const DISPLAY_MAX_INDEX = 20

class App extends Component {
  state = {
    rows   : [],
    filters: [],
    isLoading: true,
  }
  cacheRows     = []
  cacheFilters  = []

  componentDidMount() {
    const filters = [
      this.createFilterCommon(),
      this.createFilterSearch(),
    ]
    this.setState({ filters })
    this.load()
  }

  load = async () => {
    const resp = await fetch(trn)
    const data = await resp.text()
    const rows = data.split('\n').map((r, id) => {
      const [en, zh, common] = r.split('\t')
      return {
        id, en, zh, common,
        enlc: en.toLowerCase(),
        zhlc: zh.toLowerCase(),
      }
    })
    this.setState({ rows, isLoading: false })
  }

  updateFilter = (i, createFilter) => (evt, data) => {
    const value =
      data.type === "checkbox" ? data.checked :
      data.type === "text"     ? data.value   :
      undefined
    const filters = this.state.filters.slice()
    filters[i] = createFilter(value)
    this.setState({ filters })
  }

  createFilterCommon = (isTrue=true) => (rows) => {
    return isTrue === false ? rows :
      rows.filter(r => r.common === '1')
  }

  createFilterSearch = (keyword="") => (rows) => {
    // 0: full match
    // 1: start with
    // 2: partial match
    const group = Array(3).fill().map(i => [])
    const kw = keyword.toLowerCase()
    for (const row of rows) {
      const { enlc, zhlc } = row
      if (enlc === kw || zhlc === kw) {
        group[0].push(row)
        continue
      }
      if (enlc.startsWith(kw) || zhlc.startsWith(kw)) {
        group[1].push(row)
        continue
      }
      if (enlc.includes(kw) || zhlc.includes(kw)) {
        group[2].push(row)
        continue
      }
    }
    return group.reduce((acc, cur) => acc.concat(cur), [])
    // return rows.filter(r => r.searchString.includes(kw))
  }

  render() {
    const { filters, isLoading } = this.state
    const { cacheRows, cacheFilters } = this

    let rows = this.state.rows
    let isCacheHit = true
    if (isLoading === false) {
      for (const [i, filter] of filters.entries()) {
        if (isCacheHit && filter === cacheFilters[i]) {
          // console.log(`cache hit ${i}`)
          rows = cacheRows[i]
        }
        else {
          // console.log(`cache miss ${i}`)
          isCacheHit = false
          rows = filter(rows)
          cacheRows[i] = rows
          cacheFilters[i] = filter
        }
      }
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
                <Checkbox label={'Published'} defaultChecked
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
          ))}
          {isLoading ? (
            <Table.Row disabled>
              <Table.Cell colSpan='2'>Loading...</Table.Cell>
            </Table.Row>
          ) : null}
          {hideNum > 0 ? (
            <Table.Row disabled>
              <Table.Cell colSpan='2'>{hideNum} more...</Table.Cell>
            </Table.Row>
          ) : null}
          </Table.Body>
        </Table>

        <footer>
          <p>
            &copy; <a href="https://dazzyd.org">Dazzy Ding</a> | <a href="https://github.com/yukixz/eve-trn">Github</a>
            <br/>
            All Eve Related Materials are property of <a href="https://www.ccpgames.com/">CCP Games</a>
          </p>
        </footer>
      </div>
    )
  }
}

export default App
