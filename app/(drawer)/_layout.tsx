import Admin from '@/app/(drawer)/admin';
import HomeScreen from '@/app/(drawer)/Homescreen';
import MyStore from '@/app/(drawer)/MyStore';
import PaymentInfo from '@/app/(drawer)/PaymentInfo';
import Post from '@/app/(drawer)/Post';
import Product from '@/app/(drawer)/Product';
import ProductDetail from '@/app/(drawer)/Productdetail';
import Purchased from '@/app/(drawer)/purchased';
import QuanLyTaiKhoan from '@/app/(drawer)/quanlytaikhoan';
import TaiKhoan from '@/app/(drawer)/taikhoan';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from './login';
import RegisterScreen from './RegisterScreen';

const Drawer = createDrawerNavigator();

export default function DrawerLayout() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Homescreen" component={HomeScreen} />
      <Drawer.Screen name="Product" component={Product} />
      <Drawer.Screen name="TaiKhoan" component={TaiKhoan} />
      <Drawer.Screen name="ProductDetail" component={ProductDetail} />
      <Drawer.Screen name="QuanLyTaiKhoan" component={QuanLyTaiKhoan} />  
      <Drawer.Screen name="Mystore" component={MyStore} />
      <Drawer.Screen name="Purchased" component={Purchased} />
      <Drawer.Screen name="Post" component={Post} />
      <Drawer.Screen name="admin" component={Admin} />
      <Drawer.Screen name="PaymentInfo" component={PaymentInfo} />
      <Drawer.Screen name='LoginScreen' component={LoginScreen}/>
      <Drawer.Screen name='RegisterScreen' component={RegisterScreen}/>
    </Drawer.Navigator>
  );
}