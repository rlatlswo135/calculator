import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Pressable,TouchableOpacity,ImageBackground,ScrollView } from 'react-native';
import {useState} from 'react'
let divisorIndex=0;
let beforeKey = ''
export default function App() {
  const [nowCal,setNowCal] = useState(true)
  const [display,setDisplay] = useState([])
  const [calArray,setCalArray] = useState([])
  const [calResult , setCalResult] = useState('')
  const [calHistory, setCalHistory] = useState([])
  let obj = {
    percent:{
      img:require('./inuse/icon_percentage.png'),
      display:'%'
    },
    divide:{
      img:require('./inuse/icon_divide.png'),
      display:'÷'
    },
    plus:{
      img:require('./inuse/icon_add.png'),
      display:'+'
    },
    minus:{
      img:require('./inuse/icon_minus.png'),
      display:'-'
    },
    multiple:{
      img:require('./inuse/icon_multiple.png'),
      display:'x'
    },
    remove:{
      img:require('./inuse/icon_cancle.png'),
      display:''
    }    
  }
  let array = [
    ['C',7,4,1,'remove'],
    ['percent',8,5,2,0],
    ['divide',9,6,3,'.'],
    ['multiple','minus','plus','=']
  ]
  const calNum = (array)=>{
    let copy = [...array]
    if(!array.includes('x') && !array.includes('÷')){
      let historyCopy = [...calHistory]
      historyCopy.push([display.join(''),getResult(copy)])
      setCalHistory(historyCopy)
      return setCalResult(getResult(copy))
    }
    for(let i=0; i<copy.length; i++){
      if(copy[i] === 'x'){
        copy[i-1] = copy[i-1] * copy[i+1]
        copy = [...copy.slice(0,i),...copy.slice(i+2)]
      }
      if(copy[i] === '÷'){
        copy[i-1] = copy[i-1] / copy[i+1]
        copy = [...copy.slice(0,i),...copy.slice(i+2)]
      }
    }
    calNum(copy)
  }
  const getResult=(target)=>{
    let whatCal = ''
    let result = target.reduce((start,item,index) => {
      if(typeof(item) === 'string'){
        whatCal = item
        return start = start+0
      }
      else{
        if(index === 0){
          return start = start+item
        }
        else if(whatCal === '+'){
          return start = start+item
        }
        else if(whatCal === '-'){
          //테스트결과 1-0.9-0.1이 0이안나옴
          return start = Math.round((start-item)*10)/10
        }
      }
  },0)
    return editPrice(result)
  }
  const editPrice = (price) =>{
    if(price<1){
      return String(price)
    }
    const includeDot = String(price).includes('.')
    const divideDot = String(price).split('.')
    const beforeDot = divideDot[0].split('')
    const afterDot = includeDot?divideDot[1].split(''):''

    let beforeDotArray = beforeDot.reverse()
    let result = [];
    //결국 맨뒤숫자는 3개씩 고정이고 맨앞에 개수에따라서 다를거니  reverse를 해서 앞부터 3개씩 끊는게 좋을거같다고 판단햇으니
    let count = beforeDotArray.length%3 !==0 ? Math.trunc((beforeDotArray.length/3)+1) : beforeDotArray.length/3

    for(let i=1; i<=count; i++){
            result.push(beforeDotArray.splice(0,3))
        if(i !== count){
            result.push(',')
        }
    }
    const resultBeforeDot = result.flat().reverse().join('')
    if(includeDot){
      return ([resultBeforeDot,afterDot].join('.'))
    }
    return resultBeforeDot
}
  const onPress = (key) => {
    let copy = [...display]
    let calCopy = [...calArray]
    const isString = typeof(key) === 'string'
    if(isString === true){
      if(key === '='){
        // 계산구하는 탭
        if(beforeKey !== key){
          //result를 여러번누를때 마지막 숫자를 도 계산하는 calArray안에 넣지 않기위해 사용하는 beforeKey 변수
          let number = changeNum(divisorIndex,copy,true)
          calCopy.push(number)
          calNum(calCopy)
          beforeKey = key
        }else{
          calNum(calCopy)
        }
      }
      else if(key === 'C'){
        copy = []
        calCopy = []
        divisorIndex=0
        beforeKey = key
        setCalResult('')
      }
      else if(key === 'remove'){
        copy.pop()
      }
      else{
        //사칙연산 기호가들어올때
        beforeKey = key
        //마지막도 연산기호면 또 연산기호가 display에 들어가게하지 않기위해 (아래)
        const lastKeyIsString = copy[copy.length-1] === '0' ? false : !Number(copy[copy.length-1])
        if(lastKeyIsString === false){
          if(key === '.'){
            copy.push(key)
          }else{
            //display와 keypad의 이미지가 다르니까 이런식으로.
            copy.push(obj[key].display)
            /*
            이부분 만져야 => 연산기호들어옴 => calCopy의 마지막이 숫자일때만 calArray안에 숫자가 들어간후 연산기호 들어가야함

            */
            if(typeof(calCopy[calCopy.length-1])!=='number'){
              //calArray 계산배열에 마지막이 연산기호일때만 숫자가들어가야한다. 숫자인데 숫자가 또들어가면 안됨
              let number = changeNum(divisorIndex,copy)
              calCopy.push(number)
            }
            divisorIndex = copy.length
            calCopy.push(obj[key].display)
          }
        }
      }
    }else{
      copy.push(String(key))
      beforeKey = key
    }
    setDisplay(copy)
    setCalArray(calCopy)
  }

  const changeNum = (index,array,isResult=false)=>{
    // isResult는 계산값을 구할때와 연산기호가 들어갈때의 케이스를 분기해주기위해 사용
    //string으로 1개씩 저장된 display array를 합쳐서 숫자로 바꿔주는
    let lastIndex = isResult ? array.length : array.length - 1
    //계산값을구할땐 display가 숫자로 끝날거니까 끝까지 해주고, 연산기호가 들어갈때는 마지막연산기호는 숫자를 합치는데  제외해야하니 -1
    let numbers = array.slice(index,lastIndex)
    let result = numbers.reduce((start,item) => start=start+item,'')

    return Number(result)
  }

  const renderKeyPad = ()=>{
    return array.map((column,idx) => {
      return(
        <View key={`padCol-${idx}`} style={styles.keyPadCol}>
          {column.map((key,index) => {
            let style=typeof(key) === 'string' ? {backgroundColor:"#D2D2D2"} : {backgroundColor:"#F4F4F4"}
            array.length-1 === idx ? style = {backgroundColor:"#FFC6CC"} : null
            array.length-1 === idx && column.length-1 === index ? style={backgroundColor:"#F54F61",flex:2} : null
            return(
              obj[key] !== undefined
              ?
              <TouchableOpacity style={{...styles.button,...style}} key={`num-${index}`} onPress={()=>onPress(key)}>
                <ImageBackground style={{...styles.img}} source={obj[key]['img']}>
                  <Text style={{fontSize:45,color:"rgba(255,255,255,0.1)"}}>ㅁ</Text>
                </ImageBackground>
              </TouchableOpacity>
              :
              <TouchableOpacity style={{...styles.button,...style}} key={`num-${index}`} onPress={()=>onPress(key)}>
                <Text style={{...styles.buttonText}}>{key}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )
    })
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{fontSize:20,fontWeight:"600"}}>{nowCal?'Calculator':'Result'}</Text>
      </View>
      {nowCal ? 
            <View style={styles.main}>
            <View style={styles.disPlay}>
              <View style={styles.disPlayMini}>
                <Text style={{color:'gray',fontSize:20}}>
                  {display.join('')}
                </Text>
              </View>
              <View style={styles.disPlayMain}>
                <Text style={{fontSize:40,color:"tomato",marginTop:20}}>
                  {calResult}
                </Text>
              </View>
            </View>
            <View style={styles.keyPad}>
              {renderKeyPad()}
            </View>
          </View> :
          <View style={{...styles.main,paddingTop:10}}>
            <View style={{alignItems:"flex-end"}}>
              <Text style={{borderWidth:1,borderRadius:10,padding:3,borderColor:"rgba(0,0,0,0.4)"}} onPress={()=>setCalHistory([])}>Clear</Text>
            </View>
            <ScrollView>
              {calHistory.map((history,index) => {
                return(
                  <View style={styles.history} key={`history-${index}`}>
                    <Text style={{color:'gray',fontSize:15}}>{history[0]}</Text>
                    <Text style={{fontSize:30,color:"tomato",marginTop:5}}>{history[1]}</Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
          }
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={()=>setNowCal(true)}>
          <ImageBackground style={styles.footerImg} source={nowCal?require('./inuse/calculator_active.png'):require('./inuse/calculator_inactive.png')}>
            <Text style={{fontSize:75,color:"rgba(255,255,255,0.01)"}}>a</Text>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={()=>setNowCal(false)}>
        <ImageBackground style={styles.footerImg} source={nowCal?require('./inuse/result_inactive.png'):require('./inuse/result_active.png')}>
          <Text style={{fontSize:75,color:"rgba(255,255,255,0.01)"}}>a</Text>
        </ImageBackground>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:20
  },
  header:{
    flex:1,
    paddingTop:30,
    paddingBottom:15,
    alignItems:"center",
    borderBottomWidth:1,
    borderColor:"rgba(0,0,0,0.1)"
  },
  disPlay:{
    flex:2,
    paddingTop:30,
    alignItems:'flex-end',
  },
  keyPad:{
    flex:10,
    flexDirection:"row"
  },
  keyPadCol:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  button:{
    flex:1,
    width:"90%",
    borderRadius:30,
    margin:7,
    alignItems:"center",
    justifyContent:"center"
  },
  buttonText:{
    fontSize:30,
  },
  img:{
    resizeMode:"cover",
    justifyContent:"center",
    alignItems:"center"
  },
  footer:{
    flex:1.5,
    flexDirection:"row",
    borderTopWidth:1,
    borderColor:"rgba(0,0,0,0.1)"
  },
  footerItem:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
  },
  footerImg:{
  },
  main:{
    flex:15
  },
  history:{
    marginTop:15
  }
});
