import React from "react";
import axios from 'axios'
import {browserHistory} from 'react-router'


import { BootstrapTable, TableHeaderColumn} from  'react-bootstrap-table';
import '../css/react-bootstrap-table-all.min.css';

function priceFormatter(cell, row) {
    return ` ${cell/100} $`;
}

function dateFormatter( cell, row){
  var date='  ';
  date += cell.slice(8,10) + '/'+cell.slice(5,7)+'/'+cell.slice(0,4);
  date += " "+cell.slice(11,13)+':'+cell.slice(14,16);
  
  return date;
}



export default class TableHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
          purchases: [],
          loading : false,
          totalSize : 0,
          currentPage : 1,
          sizePerPage : 10,
          id : '',
          field : 'purchasedDate',
          sortOrder : 'desc'
    };
    this.onSizePerPageList = this.onSizePerPageList.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onSortChange = this.onSortChange.bind(this)
    this.pop = this.pop.bind(this)
  }

  componentWillMount(){
      this.setState({ loading : true })
      let params = {
        page : this.state.currentPage,
        pageSize : this.state.sizePerPage,
        field : 'purchasedDate',
        sortOrder : 'desc'
      }

      axios.post('/shoppinghistory', params
      ).then(response =>{
          if(response.data){
                  this.setState({ 
                      purchases : response.data.purchases,
                      totalSize : response.data.dataLength,
                      loading : false })
          }
          this.setState({ loading : false })
      })
  }

  onSortChange(sortName, sortOrder) {
    let params = {
          page : this.state.currentPage,
          pageSize : this.state.sizePerPage,
          field : sortName,
          order : sortOrder
        }

    axios.post(`/shoppinghistory`,params)
    .then( response => 
        this.setState({
            field : sortName,
            sortOrder : sortOrder,
            purchases : response.data.purchases,
            totalSize : response.data.dataLength
        })
    )
  }

  onPageChange(page, sizePerPage) {
    let params = {
      page : page,
      pageSize : sizePerPage,
      field : this.state.field,
      order : this.state.sortOrder
    }
    axios.post(`/shoppinghistory`, params ).then( response => 
            this.setState({
                  purchases : response.data.purchases,
                  currentPage : page,
                  totalSize : response.data.dataLength
            })
    )
  }

  onSizePerPageList( sizePerPage ) {
    let params = {
      page : this.state.currentPage,
      pageSize : sizePerPage,
      field : this.state.field,
      order : this.state.sortOrder
    }
    axios.post(`/shoppinghistory`, params ).then( response => 
      this.setState({
            totalSize : response.data.dataLength,
            purchases : response.data.purchases,
            sizePerPage : sizePerPage
      })
    )
  }

  pop (row ){
    browserHistory.push(`shoppinghistory/${row._id}`)
  }

  render() {

    const { purchases, loading , totalSize} = this.state;
    const tableHeight = ( 39 * (this.state.sizePerPage + 1)) + 'px';

    const options = {
      sizePerPageList: [ {
          text: '5', value: 5
        }, {
          text: '10', value: 10
        }, {
          text: 'All', value: totalSize
        } ],
        sizePerPage : this.state.sizePerPage,
        onPageChange : this.onPageChange,
        page : this.state.currentPage,
        onSizePerPageList : this.onSizePerPageList,
        paginationPosition : 'top',
        onSortChange : this.onSortChange,
        onRowClick : this.pop 
    };
    
    const selectRowProp = {
        mode: 'radio',
        bgColor: 'grey', 
        hideSelectColumn: true,
        clickToSelect: true 
      };

    return (
      
        <div>{ loading ? <div className="col-sm-12 col-md-10 col-md-offset-5"> Loading data...</div> :
              <BootstrapTable data = { purchases } 
                              striped = { true }
                              pagination = { true }
                              remote = { true }
                              fetchInfo = { { dataTotalSize: this.state.totalSize } }
                              options = {options} 
                              selectRow={ selectRowProp }
                              containerStyle={ { height : tableHeight } }
                              >
                  <TableHeaderColumn isKey={true} dataField='_id' dataSort={ true }>Order ID</TableHeaderColumn>
                  <TableHeaderColumn dataField='purchasedDate' 
                                     dataSort={ true } 
                                     dataFormat={ dateFormatter } >Purchased date</TableHeaderColumn>
                  <TableHeaderColumn dataField='status' dataSort = { true } >Status</TableHeaderColumn>
                  <TableHeaderColumn dataField='purchasesSum' dataSort={ true } dataFormat={ priceFormatter }>Order Price</TableHeaderColumn>
              </BootstrapTable>}
        </div>
    );
  }
}

