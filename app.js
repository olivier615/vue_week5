const api = 'https://vue3-course-api.hexschool.io/v2';
const path = 'otispath';

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

configure({
  generateMessage: localize('zh_TW'),
});

const app = Vue.createApp({
  data() {
    return {
      products: {},
      productId: "",
      cartData: {},
      isLoading:'',
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
    }
  },
  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    updateQty(item) {
      this.isLoading = item.id;
      const data = {
        "product_id": item.id,
        "qty": item.qty
      };
      axios.put(`${api}/api/${path}/cart/${item.id}`, {
          data
        })
        .then(res => {
          this.getCartData();
          this.isLoading = '';
        })
        .catch(err => {
          console.log(err);
          this.isLoading = '';
        });
    },
    deleteCartItem(id) {
      this.isLoading = id;
      axios.delete(`${api}/api/${path}/cart/${id}`)
        .then(res => {
          this.getCartData();
          this.isLoading = '';
        })
        .catch(err => {
          console.log(err);
          this.isLoading = '';
        });
    },
    cleanCart() {
      this.isLoading = true;
      axios.delete(`${api}/api/${path}/carts`)
        .then(res => {
          this.getCartData();
          this.isLoading = '';
        })
        .catch(err => {
          console.log(err);
          this.isLoading = '';
        });
    },
    addItemToCart(id, qty = 1) {
      const data = {
        "product_id": id,
        "qty": qty
      };
      this.isLoading = id;
      axios.post(`${api}/api/${path}/cart`, {
          data
        })
        .then(res => {
          this.getCartData();
          this.isLoading = '';
        })
        .catch(err => {
          console.log(err);
          this.isLoading = '';
        });
    },
    getProducts() {
      axios.get(`${api}/api/${path}/products/all`)
        .then(res => {
          this.products = res.data.products
          console.log(this.products);
        })
        .catch(err => {
          console.log(err);
        })
    },
    openProductModal(id) {
      this.productId = id;
      this.$refs.productModal.openModal();
    },
    getCartData() {
      axios.get(`${api}/api/${path}/cart`)
        .then(res => {
          this.cartData = res.data.data;
        })
        .catch(err => {
          console.log(err);
        })
    },
    submitOrder(){
      this.isLoading = true;
      axios.post(`${api}/api/${path}/order`,{data:this.form})
        .then(res => {
          alert('訂單已成功送出');
          this.getCartData();
          this.$refs.form.resetForm();
          this.isLoading = '';
        })
        .catch(err => {
          console.log(err);
          this.isLoading = '';
        })
    }
  },
  mounted() {
    this.getProducts();
    this.getCartData();
  },
})

app.component('product-modal', {
  template: '#userProductModal',
  data() {
    return {
      product: {},
      modal: {},
      qty: 1,
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
  props: ['id'],
  watch: {
    id() {
      this.product = {};
      this.getProduct();
    }
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${api}/api/${path}/product/${this.id}`)
        .then(res => {
          this.product = res.data.product
        })
        .catch(err => {
          console.log(err);
        })
    },
    addItem() {
      this.$emit('addItem', this.product.id, this.qty);
      this.closeModal();
      this.qty = 1;
    }
  }
});

app.mount('#app');