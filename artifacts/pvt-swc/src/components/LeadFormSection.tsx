import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  interest: string;
};

export function LeadFormSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      interest: ""
    }
  });

  const onSubmit = (data: FormData) => {
    // In a real app, this would send data to an API
    console.log("Form submitted:", data);
    setIsSubmitted(true);
  };

  const benefits = [
    "tài liệu về tư duy tài chính nền tảng",
    "cập nhật video và nội dung mới",
    "thông tin về cộng đồng và các chương trình đồng hành",
    "những chia sẻ phù hợp với mối quan tâm ở từng giai đoạn"
  ];

  return (
    <section id="lien-he" className="py-24 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                Liên hệ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Nhận tài liệu / cập nhật mới từ Thắng SWC
              </h2>
              <p className="text-lg text-muted-foreground">
                Nếu anh/chị muốn nhận thêm những tài liệu nền tảng, cập nhật nội dung mới hoặc thông tin về các chương trình phù hợp, hãy để lại thông tin ở đây.
              </p>
            </div>

            <ul className="space-y-4">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="mt-1 mr-3 rounded-full bg-primary/20 p-1">
                    <Check size={14} className="text-primary" />
                  </div>
                  <span className="text-foreground/90">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-border shadow-lg relative overflow-hidden"
          >
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-12"
              >
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Cảm ơn anh/chị!</h3>
                <p className="text-muted-foreground">
                  Thông tin đã được ghi nhận. Tôi sẽ sớm gửi những nội dung phù hợp đến anh/chị.
                </p>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    rules={{ required: "Vui lòng nhập họ và tên" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập họ và tên..." {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: "Vui lòng nhập email",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email không hợp lệ"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Số điện thoại hoặc Zalo (Không bắt buộc)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại..." {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Mối quan tâm chính</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Chọn một chủ đề..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Tư duy tài chính & đầu tư">Tư duy tài chính & đầu tư</SelectItem>
                            <SelectItem value="Phát triển bản thân & sự nghiệp">Phát triển bản thân & sự nghiệp</SelectItem>
                            <SelectItem value="Hệ thống & cộng đồng">Hệ thống & cộng đồng</SelectItem>
                            <SelectItem value="Tất cả các chủ đề trên">Tất cả các chủ đề trên</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base rounded-lg">
                    Nhận thông tin
                  </Button>
                  
                  <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                    Tôi tôn trọng sự riêng tư của anh/chị. Thông tin được dùng để gửi nội dung phù hợp, không làm phiền quá mức và không phục vụ cho các lời mời chào thiếu chọn lọc.
                  </p>
                </form>
              </Form>
            )}
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
