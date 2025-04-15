<script lang="ts" setup>
import { ElSelect, ElOption, ElCheckbox, type CheckboxValueType } from "element-plus";
import {
  computed,
  ref,
  watch,
  watchEffect,
  useAttrs,
  type PropType,
} from "@vue/runtime-core";
import { type HiSelectOptionsConfig } from "@hi-block/definitions";
import { getFieldValueByPath, getRequestParams } from "@hi-block/utils";
import { usePost, useGet } from "@hi-block/http"; //
import { SelectProps } from "element-plus/es/components/select/src/select";
import { isUndefined, isStrictObject } from "hi-datatype-operation";

const props = defineProps({
  ...SelectProps,
  modelValue: {
    type: [String, Number, Array<string | number>],
    default: [],
  },
  options: {
    type: Object as PropType<HiSelectOptionsConfig<any>>,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object as PropType<Record<string, any>>,
  },
  valueFormatToString: {
    type: Boolean,
    default: false,
  },
  default_select_all: {
    type: Boolean,
    default: false,
  },
  default_select_first: {
    type: Boolean,
    default: false,
  },
  name: String,
  use_selected_option: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);
const { uselabel } = useAttrs();
const SelectModelValue = computed({
  set(value) {
    if (!props.multiple) {
      let selected_label = "";
      if (uselabel) {
        if (!isUndefined(select_options.value) && value) {
          const selected_option = select_options.value.find(
            (item: any) => item[value_key] === value
          );
          selected_label = selected_option ? selected_option[label_key] : "";
        }
        if (selected_label && isStrictObject(props.formData)) {
          Reflect.set(props.formData, `${props.name}Label`, selected_label);
        }
      }
    }
    if (props.use_selected_option && isStrictObject(props.formData)) {
      const selected_option = value
        ? select_options.value.find((item: any) => item[value_key] === value)
        : {};
      props.formData[`${props.name}_selected_option`] = selected_option;
    }
    if (props.valueFormatToString && props.multiple && Array.isArray(value)) {
      emit("update:modelValue", value.join(","));
    } else {
      emit("update:modelValue", value);
    }
    if (Array.isArray(value)) {
      if (isStrictObject(props.formData)) {
        props.formData[`${props.name}_selected_options`] =
          select_options.value.filter((item: any) => {
            return value.includes(Reflect.get(item, value_key));
          });
      }
      if (value.length === 0) {
        checkall.value = false;
        indeterminate.value = false;
      } else if (value.length === select_options.value.length) {
        checkall.value = true;
        indeterminate.value = false;
      } else {
        indeterminate.value = true;
      }
    }
  },
  get() {
    if (
      props.valueFormatToString &&
      props.multiple &&
      typeof props.modelValue === "string"
    ) {
      return props.modelValue.split(",");
    }
    return props.modelValue;
  },
});
// 获取选项列表
const select_options = ref<Record<string, any>[]>([]);
watch(
  select_options,
  (select_options: any) => {
    if (props.default_select_all) {
      SelectModelValue.value = select_options.map((item: any) =>
        Reflect.get(item, value_key)
      );
    }
    if (props.default_select_first) {
      SelectModelValue.value = Reflect.get(select_options[0], value_key);
    }
  },
  { deep: true }
);
watchEffect(async () => {
  if (props?.options?.defaultOptions) {
    select_options.value = props.options.defaultOptions;
    return;
  }
  let res = [];
  if (props.options?.args) {
    if (
      props.options.args[2] &&
      typeof props.options.args[2] === "object" &&
      Reflect.has(props.options.args[2], "param_key_name")
    ) {
      const param_key_name: string = Reflect.get(
        props.options.args[2],
        "param_key_name"
      );
      const param_value_key: string = Reflect.get(
        props.options.args[2],
        "param_value_name"
      );
      const param_key_entries: any = Reflect.get(
        props.options.args[2],
        "param_key_entries"
      );
      if (param_key_entries) {
        param_key_entries.foreach((item: any) => {
          const [key_name, value_name]: any = Object.entries(item)[0];
          if (
            !isUndefined(props.formData) &&
            !isUndefined(props.options.args)
          ) {
            const param_value: string = Reflect.get(props.formData, value_name);
            Reflect.set(props.options.args[1], key_name, param_value);
          }
        });
      }
      const param_value: string = Reflect.get(
        props.formData || {},
        param_value_key
      );
      if (!props.options.args[1]) {
        props.options.args[1] = {};
      }
      Reflect.set(props.options.args[1], param_key_name, param_value);
      props.options.args[2].param_not_null_key = param_key_name;
      res = (await usePost.apply(null, props.options.args)) || [];
    }
    if (props.options.args[2]?.res_key_name) {
      const res_key_name = Reflect.get(props.options.args[2], "res_key_name") as string;
      Reflect.set(props.options.args[2], "onFormat", (res: any) => {
        return res_key_name.includes("res.")
          ? eval(res_key_name)
          : getFieldValueByPath(res_key_name, res);
      });
      res = (await usePost.apply(null, props.options.args)) || [];
    }
    /**
     * 2024-07-01
     * 优化取缔 param_key_name、param_value_key、param_key_entries
     * benchmarkPrice
     * billManageForIndex
     */
    let [url, param, options] = props.options.args;
    const request_method =
      options && Reflect.has(options, "request_method")
        ? Reflect.get(options, "request_method")
        : "post";
    param = getRequestParams(param, options as Record<string, any>, props);
    res =
      request_method === "get"
        ? await useGet(url, param, options)
        : (await usePost(url, param, options)) || [];

    select_options.value = res
      .filter((item: any) => {
        if (typeof item === "string") {
          return item;
        }
        return item && item?.[label_key] !== null && item?.[value_key] !== null;
      })
      .map((item: any) => {
        if (typeof item === "string") {
          return {
            [label_key]: item,
            [value_key]: item,
          };
        }
        return item;
      });
  }
});

const checkall = ref<boolean>(false);
const indeterminate = ref<boolean>(false);
const handleCheckall = (val: CheckboxValueType) => {
  if (val) {
    SelectModelValue.value = select_options.value.map(
      (option: Record<string, any>) => option[value_key]
    ) as any;
  } else {
    SelectModelValue.value = [];
  }
};
const [label_key, value_key] = props!.options!.alias || ["label", "value"];
</script>
<template>
  <el-select
    v-bind="props"
    collapse-tags
    :multiple="multiple"
    :filterable="true"
    class="select"
    v-model="SelectModelValue"
  >
    <template #header v-if="multiple">
      <el-checkbox
        v-model="checkall"
        :indeterminate="indeterminate"
        @change="handleCheckall"
      >
        全选
      </el-checkbox>
    </template>
    <el-option
      v-for="(item, index) in select_options"
      :key="`el-option-${index}`"
      :label="item[label_key]"
      :value="item[value_key]"
    />
  </el-select>
</template>