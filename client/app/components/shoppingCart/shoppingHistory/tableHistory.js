import React from "react";
import axios from 'axios'
import {browserHistory} from 'react-router'


import { BootstrapTable, TableHeaderColumn} from  'react-bootstrap-table';
import '../css/react-bootstrap-table-all.min.css';

function priceFormatter(cell, row) {
    return cell%100 == 0 ? cell/100+'.00 $': cell/100+' $';
}

function dateFormatter( cell, row){
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];  
  var date='  ';
  let curdate = new Date(cell)
  
  let dayOfWeek = days[curdate.getDay()];
  date += cell.slice(11,13)+':'+cell.slice(14,16) + " "+ dayOfWeek+ ", ";
  date += cell.slice(8,10) + '/'+cell.slice(5,7)+'/'+cell.slice(0,4);
  
  
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
          sizePerPage : 5,
          id : '',
          field : 'purchasedDate',
          sortOrder : 'desc',
          process: false
    };
    this.onSizePerPageList = this.onSizePerPageList.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onSortChange = this.onSortChange.bind(this)
    this.pop = this.pop.bind(this);
    this.noData = this.noData.bind(this);
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
        this.setState({process:true})
    axios.post(`/shoppinghistory`,params)
    .then( response => 
        this.setState({
            field : sortName,
            sortOrder : sortOrder,
            purchases : response.data.purchases,
            totalSize : response.data.dataLength,
            process:false
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
    this.setState({process:true})
    axios.post(`/shoppinghistory`, params ).then( response => 
            this.setState({
                  purchases : response.data.purchases,
                  currentPage : page,
                  totalSize : response.data.dataLength,
                  process:false
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
    this.setState({process:true})
    axios.post(`/shoppinghistory`, params ).then( response => 
      this.setState({
            totalSize : response.data.dataLength,
            purchases : response.data.purchases,
            sizePerPage : sizePerPage,
            process : false
      })
    )
  }
  noData(){
    if(this.state.totalSize ===0){
      return 'No data'
    }else if(this.state.process){
      return "Please wait..."
    }
  }


  pop (row ){
    browserHistory.push(`shoppinghistory/${row._id}`)
  }

  render() {

    const { purchases, loading , totalSize, process} = this.state;
    const tableHeight = totalSize > this.state.sizePerPage ? ( 39 * (this.state.sizePerPage + 1)) + 'px'
                                                                  : ( 39 * (totalSize + 1)) + 'px';
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
        onRowClick : this.pop ,
        // noDataText : this.noData()
    };
    
    const selectRowProp = {
        mode: 'radio',
        bgColor: 'grey', 
        hideSelectColumn: true,
        clickToSelect: true 
      };

    return (
      
        <div>{ loading ? <div className="col-sm-12 col-md-10 col-md-offset-5"> Loading data...</div> :
        <div>
               <div className="col-sm-12 col-md-10 col-md-offset-5"> <h3>Shopping history </h3>
                 <p>{ process ? <label>Loading data...</label>:<label >&nbsp;</label>}</p></div>
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
              </BootstrapTable>
              </div>}
        </div>
    );
  }
}

